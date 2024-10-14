import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const $ = el => document.querySelector(el)
const $form = $('form')
const $input = $('input')
const $template = $('#message-template')
const $messages = $('ul')
const $container = $('main')
const $button =$('button')
const $info = $('small')


const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC"

let messages = []

const engine = await CreateMLCEngine(
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      console.log('initProgressCallback',info)
      $info.textContent = `${info.text}`
      if (info.progress == 1){
        $button.removeAttribute('disabled')
      }
    }

  }

)




$form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const messageText = $input.value.trim()

  //añadimos el mensaje en el DOM
  if (messageText !== '') {
    $input.value = ''
  }

  addMessage(messageText, 'user')
  $button.setAttribute('disabled', true)

  const userMessage = {
    role:'user',
    content:messageText

  }
  messages.push(userMessage)

  const chunks = await engine.chat.completions.create({
     messages,
     stream:true

  })

  let reply = ""
  const $botMessage = addMessage("", 'bot')


  for await (const chunk of chunks){
    const [choice] = chunk.choices
    //const choice = chunk.choices[0]
    const content = choice.delta.content ?? ""
    reply += content
    $botMessage.textContent = reply
  }

  $button.removeAttribute('disabled')
  messages.push({
    role: 'assistant',
    content:reply

  }

  )
})

function addMessage(text, sender) {
  const clonedTemplate = $template.content.cloneNode(true)
  const $newMessage = clonedTemplate.querySelector('.message')

  const $who = $newMessage.querySelector('span')
  const $text = $newMessage.querySelector('p')

  $text.textContent = text
  $who.textContent = sender === 'bot' ? 'GPT' : 'User'
  $newMessage.classList.add(sender)

  $messages.appendChild($newMessage)

  $container.scrollTop = $container.scrollHeight

  return $text

}
