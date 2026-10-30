const form=document.getElementById('chat-form');
const input=document.getElementById('prompt');
const sendButton=document.getElementById('send-button');
const messagesEl=document.getElementById('messages');
const welcome=document.getElementById('welcome');
const historyEl=document.getElementById('history');
let conversation=[];
let chats=[];
let busy=false;
function addMessage(role,text){const wrap=document.createElement('article');wrap.className='message '+role;const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent=role==='user'?'You':'✦';const body=document.createElement('div');body.className='message-body';const label=document.createElement('div');label.className='message-label';label.textContent=role==='user'?'YOU':'ARJUN AI';const content=document.createElement('div');content.textContent=text;body.append(label,content);wrap.append(avatar,body);messagesEl.append(wrap);messagesEl.parentElement.scrollTop=messagesEl.parentElement.scrollHeight;return content;}
function setBusy(value){busy=value;sendButton.disabled=value;sendButton.textContent=value?'…':'↑';}
function startNewChat(){conversation=[];messagesEl.replaceChildren();welcome.hidden=false;input.focus();}
function saveChat(question){const title=question.length>34?question.slice(0,34)+'…':question;chats.unshift({title,items:[...conversation]});chats=chats.slice(0,12);renderHistory();}
function renderHistory(){historyEl.replaceChildren();if(!chats.length){const p=document.createElement('p');p.className='history-empty';p.textContent='Your recent chats will appear here.';historyEl.append(p);return;}chats.forEach((chat,index)=>{const b=document.createElement('button');b.className='history-item';b.textContent='▱  '+chat.title;b.onclick=()=>{conversation=[...chat.items];messagesEl.replaceChildren();welcome.hidden=true;conversation.forEach(m=>addMessage(m.role,m.content));};historyEl.append(b);});}
async function sendMessage(text){if(busy||!text.trim())return;const question=text.trim();welcome.hidden=true;input.value='';input.style.height='auto';conversation.push({role:'user',content:question});addMessage('user',question);const answerNode=addMessage('assistant','');answerNode.className='typing';answerNode.textContent='Thinking…';setBusy(true);
try{const apiUrl=window.ARJUN_AI_API_URL;if(!apiUrl){throw new Error('The AI service is not connected yet. Deploy the Cloudflare Worker and add its URL in config.js.');}
const response=await fetch(apiUrl.replace(/\/$/,'')+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:conversation.slice(-20)})});
const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'The AI service could not respond. Please try again.');
const reply=typeof data.reply==='string'?data.reply:'I could not generate a response. Please try again.';answerNode.className='';answerNode.textContent=reply;conversation.push({role:'assistant',content:reply});saveChat(question);
}catch(error){answerNode.className='error-note';answerNode.textContent=error.message;conversation.pop();}finally{setBusy(false);input.focus();}}
form.addEventListener('submit',e=>{e.preventDefault();sendMessage(input.value);});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,180)+'px';});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
document.getElementById('new-chat').addEventListener('click',startNewChat);
document.getElementById('clear-history').addEventListener('click',()=>{chats=[];renderHistory();startNewChat();});
document.getElementById('menu-button').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.querySelectorAll('.suggestion').forEach(button=>button.addEventListener('click',()=>sendMessage(button.dataset.prompt)));
