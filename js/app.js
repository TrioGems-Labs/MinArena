(() => {
  const $ = id => document.getElementById(id);
  const state = { test:null, questions:[], answers:{}, index:0, started:0, timer:null, seconds:0, duration:0 };
  const labels = {iq:"IQ & BRAIN TEST", personality:"PERSONALITY TEST", gk:"GENERAL KNOWLEDGE"};
  const titles = {iq:"Let's warm up your brain.",personality:"There are no right or wrong answers.",gk:"Let's see what you know."};
  const intros = {iq:"LOGIC & REASONING",personality:"YOUR PREFERENCES",gk:"GENERAL KNOWLEDGE"};
  const PER_TEST = 30;
  // Fisher–Yates: every order is equally likely
  const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; };
  // Pick 30 random questions from the bank. Personality picks evenly from each trait so the report stays balanced.
  function pickQuestions(test){
    const bank=QUESTION_BANKS[test];
    if(test!=="personality") return shuffle(bank).slice(0,PER_TEST);
    const groups={};bank.forEach(q=>(groups[q.dimension]=groups[q.dimension]||[]).push(q));
    const dims=shuffle(Object.keys(groups)),base=Math.floor(PER_TEST/dims.length);let extra=PER_TEST%dims.length;
    let picked=[];dims.forEach(d=>{picked=picked.concat(shuffle(groups[d]).slice(0,base+(extra-->0?1:0)))});
    return shuffle(picked);
  }
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
  function show(view){["homeView","quizShell","resultShell"].forEach(id=>$(id).classList.toggle("hidden",id!==view));window.scrollTo(0,0)}
  function start(test){
    state.test=test; state.questions=pickQuestions(test).map(q=>{
      // shuffle the A–D order too, keeping the correct answer / trait weights attached to their option
      const order=shuffle([0,1,2,3].slice(0,q.options.length));
      const copy={...q,options:order.map(i=>q.options[i])};
      if(test==="personality") copy.weights=order.map(i=>q.weights[i]);
      else copy.answer=order.indexOf(q.answer);
      return copy;
    });
    state.answers={};state.index=0;state.started=Date.now();state.seconds=0;state.duration=test==="iq"?20*60:test==="gk"?15*60:10*60;
    $("quizType").textContent=labels[test];$("quizTitle").textContent=titles[test];$("quizEyebrow").textContent="QUESTION 01 OF 30";
    $("timerPill").classList.toggle("hidden",test==="personality");
    clearInterval(state.timer);
    if(test!=="personality"){updateTimer();state.timer=setInterval(()=>{state.seconds++;updateTimer();if(state.seconds>=state.duration){clearInterval(state.timer);toast("Time is up. Submitting your test.");finish()}},1000)}
    show("quizShell");renderQuestion();
  }
  function updateTimer(){const left=Math.max(0,state.duration-state.seconds);$("timerText").textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0")}
  function renderQuestion(){
    const q=state.questions[state.index],answered=Object.keys(state.answers).length;
    $("quizEyebrow").textContent=`QUESTION ${String(state.index+1).padStart(2,"0")} OF 30`;
    $("questionType").textContent=q.category||intros[state.test];
    $("questionText").textContent=q.question;
    const visual=$("questionVisual");visual.innerHTML="";
    if(q.visual){visual.innerHTML=q.visual}
    $("options").innerHTML=q.options.map((o,i)=>`<button class="option ${state.answers[state.index]===i?"selected":""}" data-option="${i}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(o)}</span></button>`).join("");
    $("options").querySelectorAll(".option").forEach(b=>b.addEventListener("click",()=>{state.answers[state.index]=Number(b.dataset.option);renderQuestion()}));
    $("prevQuestion").disabled=state.index===0;$("prevQuestion").style.opacity=state.index===0?".4":"1";
    $("nextQuestion").innerHTML=state.index===29?'Review & submit <span>→</span>':'Next question <span>→</span>';
    $("progressFill").style.width=((state.index+1)/30*100)+"%";
    $("answeredCount").textContent=answered;$("miniProgressFill").style.width=(answered/30*100)+"%";
    $("unansweredText").textContent=(30-answered)+" questions remaining";
    $("questionMap").innerHTML=state.questions.map((_,i)=>`<button class="map-dot ${i===state.index?"current":""} ${state.answers[i]!==undefined?"done":""}" data-jump="${i}">${i+1}</button>`).join("");
    $("questionMap").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{state.index=Number(b.dataset.jump);renderQuestion()}));
  }
  $("prevQuestion").addEventListener("click",()=>{if(state.index>0){state.index--;renderQuestion()}});
  $("nextQuestion").addEventListener("click",()=>{if(state.index<29){state.index++;renderQuestion()}else{const missing=30-Object.keys(state.answers).length;if(missing)toast(`${missing} question(s) are unanswered. You can still submit.`);$("submitQuiz").focus()}});
  $("submitQuiz").addEventListener("click",()=>{const missing=30-Object.keys(state.answers).length;if(missing&&!confirm(`You have ${missing} unanswered question(s). Submit anyway?`))return;finish()});
  const quit=e=>{e.preventDefault();if(confirm("Exit this test? Your current attempt will be lost.")){clearInterval(state.timer);show("homeView")}};
  $("quitQuiz").addEventListener("click",quit);$("quizHome").addEventListener("click",quit);
  function finish(){
    clearInterval(state.timer);
    const isP=state.test==="personality",total=30,answered=Object.keys(state.answers).length;
    let correct=0;state.questions.forEach((q,i)=>{if(!isP&&state.answers[i]===q.answer)correct++});
    const pct=Math.round((isP?answered/total:correct/total)*100);
    const elapsed=Math.floor((Date.now()-state.started)/1000),mm=String(Math.floor(elapsed/60)).padStart(2,"0"),ss=String(elapsed%60).padStart(2,"0");
    $("resultTitle").textContent=isP?"A little more insight into you.":pct>=80?"Brilliant effort!":pct>=60?"Nicely done.":"Every challenge is a chance to grow.";
    $("resultSubtitle").textContent=isP?"Your answers create a snapshot of your preferences.":`You completed the ${labels[state.test].toLowerCase()} challenge. Here's your result.`;
    $("scoreLabel").textContent=isP?"COMPLETION":"YOUR SCORE";$("scoreValue").textContent=isP?answered:correct;$("scoreSuffix").textContent=isP?"/30":"/30";
    $("scoreRing").style.setProperty("--score",pct+"%");
    $("scoreCaption").textContent=isP?"Your response snapshot":pct>=80?"Excellent work":pct>=60?"Good progress":"Keep exploring";
    $("scoreDescription").textContent=isP?"Your profile reflects preferences, not a fixed label.":`${pct}% correct. Review the answers to learn a little more.`;
    $("correctStat").textContent=isP?"—":correct;$("wrongStat").textContent=isP?"—":answered-correct;$("timeStat").textContent=mm+":"+ss;$("answeredStat").textContent=answered+"/30";
    $("personalityResult").classList.toggle("hidden",!isP);
    if(isP)renderPersonality();
    $("reviewHeading");renderReview();show("resultShell");
    const record={test:state.test,date:new Date().toISOString(),score:isP?null:pct,answered,time:mm+":"+ss};
    try{const history=JSON.parse(localStorage.getItem("mindarena_history")||"[]");history.unshift(record);localStorage.setItem("mindarena_history",JSON.stringify(history.slice(0,30)))}catch(e){}
  }
  function renderPersonality(){
    const dims={social:0,thinking:0,working:0,adaptability:0},counts={social:0,thinking:0,working:0,adaptability:0};
    state.questions.forEach((q,i)=>{if(state.answers[i]!==undefined){dims[q.dimension]+=q.weights[state.answers[i]];counts[q.dimension]++}});
    const names={social:"Social energy",thinking:"Thinking style",working:"Work approach",adaptability:"Adaptability"};
    const vals=Object.keys(dims).map(k=>({key:k,val:counts[k]?Math.round(dims[k]/(counts[k]*4)*100):0})).sort((a,b)=>b.val-a.val);
    const top=vals[0]?.key||"thinking";
    const profiles={social:["The Connector","You tend to draw energy from people, shared experiences and meaningful connection. You may enjoy bringing people together while balancing your need for personal space."],thinking:["The Thoughtful Strategist","You often prefer to reflect, understand the details and consider different perspectives before choosing a direction. Your thoughtful approach can bring clarity to complex situations."],working:["The Purposeful Builder","You seem motivated by meaningful progress, useful contribution and doing things well. You may enjoy turning ideas into action and seeing a task through."],adaptability:["The Flexible Explorer","You appear comfortable exploring possibilities and adjusting as situations evolve. You may enjoy variety, discovery and keeping options open."]};
    $("personalityType").textContent=profiles[top][0];$("personalityDescription").textContent=profiles[top][1];
    $("traitBars").innerHTML=vals.map(v=>`<div class="trait-row"><div class="trait-label"><span>${names[v.key]}</span><strong>${v.val}%</strong></div><div class="trait-track"><i style="width:${v.val}%"></i></div></div>`).join("");
  }
  function renderReview(){
    $("reviewList").innerHTML=state.questions.map((q,i)=>{
      const chosen=state.answers[i],isP=state.test==="personality",correct=!isP&&chosen===q.answer;
      const answer=chosen===undefined?"Not answered":q.options[chosen];
      return `<article class="review-item"><div class="review-item-head"><span>QUESTION ${String(i+1).padStart(2,"0")}</span><span>${isP?"REFLECTION":chosen===undefined?"SKIPPED":correct?"✓ CORRECT":"× INCORRECT"}</span></div><h4>${escapeHtml(q.question)}</h4><div class="review-answer">Your answer: <strong class="${!isP&&chosen!==undefined&&!correct?"wrong":""}">${escapeHtml(answer)}</strong>${!isP?`<br>Correct answer: <strong>${escapeHtml(q.options[q.answer])}</strong><br>${escapeHtml(q.explanation||"")}`:""}</div></article>`;
    }).join("");
  }
  $("retakeBtn").addEventListener("click",()=>start(state.test));
  $("homeBtn").addEventListener("click",()=>show("homeView"));
  $("resultHome").addEventListener("click",e=>{e.preventDefault();show("homeView")});
  $("brandHome").addEventListener("click",e=>{e.preventDefault();show("homeView")});
  $("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("mindarena_theme",document.body.classList.contains("light")?"light":"dark")});
  if(localStorage.getItem("mindarena_theme")==="light")document.body.classList.add("light");
  $("shareBtn").addEventListener("click",async()=>{const text=`I just completed a ${labels[state.test]} on MindArena! Try a challenge and discover something new.`;try{if(navigator.share)await navigator.share({title:"My MindArena result",text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast("Share text copied to clipboard.")}else toast(text)}catch(e){}});
  document.querySelectorAll("[data-test]").forEach(b=>b.addEventListener("click",()=>start(b.dataset.test)));
  $("year").textContent=new Date().getFullYear();
})();
