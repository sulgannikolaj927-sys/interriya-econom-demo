(function(){
  var burger=document.getElementById('burger'),nav=document.getElementById('nav');
  if(burger && nav){
    burger.addEventListener('click',function(){var o=nav.classList.toggle('is-open');burger.setAttribute('aria-expanded',o)});
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('is-open');burger.setAttribute('aria-expanded',false)})});
  }

  var range=document.getElementById('area'),num=document.getElementById('areaNum'),
      sum=document.getElementById('calcSum'),label=document.getElementById('calcLabel'),
      packs=document.querySelectorAll('.cpack'),leadPack=document.getElementById('leadPack'),leadArea=document.getElementById('leadArea');
  var price=30000,name='Работы + черновые материалы';
  function fmt(n){return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+'\u00a0₽'}
  function contactHref(){
    var p=new URLSearchParams();
    p.set('pack', String(price));
    var a=num?Math.max(1,parseInt(num.value,10)||50):50;
    p.set('area', String(a));
    return 'contacts.html?'+p.toString()+'#contacts';
  }
  function setPack(p){
    packs.forEach(function(b){var on=+b.dataset.price===+p;b.classList.toggle('is-active',on);b.setAttribute('aria-checked',on);if(on){price=+b.dataset.price;name=b.dataset.name}});
    if(leadPack) leadPack.value=String(price);
    update();
  }
  function update(){
    if(!num || !range || !sum) return;
    var a=Math.max(1,Math.min(1000,parseInt(num.value,10)||0));
    var r=Math.max(+range.min,Math.min(+range.max,a));range.value=r;
    range.style.setProperty('--p',((r-range.min)/(range.max-range.min)*100)+'%');
    sum.textContent=fmt(a*price);
    if(label) label.textContent='Ориентир по пакету «'+name+'»';
    if(leadArea) leadArea.value=a;
    var calcBtn=document.getElementById('calcBtn');
    if(calcBtn) calcBtn.setAttribute('href', contactHref());
  }

  if(range && num && sum){
    range.addEventListener('input',function(){num.value=range.value;update()});
    num.addEventListener('input',update);
    packs.forEach(function(b){b.addEventListener('click',function(){setPack(b.dataset.price)})});
  }

  try{
    var params=new URLSearchParams(location.search);
    var qp=params.get('pack'), qa=params.get('area');
    if(leadPack && qp && leadPack.querySelector('option[value="'+qp+'"]')) leadPack.value=qp;
    if(leadArea && qa) leadArea.value=qa;
    if(range && num && qp) setPack(qp);
    if(range && num && qa){num.value=qa;}
  }catch(e){}

  if(range && num && sum) update();

  /* UTM: при входе с метками сохраняем их, чтобы заявка ушла с источником */
  var UTM_KEY='interriya_utm_v1';
  function readUtmStore(){
    try{return JSON.parse(localStorage.getItem(UTM_KEY)||'{}')||{};}catch(e){return {};}
  }
  function saveUtmFromUrl(){
    try{
      var p=new URLSearchParams(location.search);
      var keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
      var store=readUtmStore();
      var has=false, i, k;
      for(i=0;i<keys.length;i++){
        k=keys[i];
        if(p.get(k)){has=true;break;}
      }
      if(has){
        store.utm=store.utm||{};
        for(i=0;i<keys.length;i++){
          k=keys[i];
          var v=p.get(k);
          if(v) store.utm[k]=v;
          else delete store.utm[k];
        }
        store.landing=location.pathname.split('/').pop()||location.href;
        store.saved_at=Date.now();
      }
      if(!store.referrer){
        var ref=document.referrer||'';
        if(ref) store.referrer=ref;
      }
      localStorage.setItem(UTM_KEY, JSON.stringify(store));
    }catch(e){}
  }
  saveUtmFromUrl();

  function digitsPhone(v){
    var d=String(v||'').replace(/\D+/g,'');
    if(d.length===11 && d.charAt(0)==='8') d='7'+d.slice(1);
    if(d.length===10 && d.charAt(0)==='9') d='7'+d;
    return d;
  }
  function prettyPhone(v){
    var d=digitsPhone(v);
    if(d.charAt(0)==='7') d=d.slice(1);
    var out='+7';
    if(!d.length) return '+7 (';
    if(d.length) out+=' ('+d.slice(0,3);
    if(d.length>=3) out+=') ';
    if(d.length>3) out+=d.slice(3,6);
    if(d.length>=6) out+='-'+d.slice(6,8);
    if(d.length>=8) out+='-'+d.slice(8,10);
    return out;
  }
  function validPhone(v){
    var d=digitsPhone(v);
    return d.length===11 && d.charAt(0)==='7';
  }
  function bindPhoneMask(input){
    if(!input) return;
    input.addEventListener('focus',function(){
      if(!input.value) input.value='+7 (';
    });
    input.addEventListener('input',function(){
      var cur=input.value;
      var d=digitsPhone(cur);
      if(cur && d===''){input.value='';return;}
      input.value=prettyPhone(cur);
    });
    input.addEventListener('blur',function(){
      if(!digitsPhone(input.value).length) input.value='';
    });
  }

  function fieldError(field, msg){
    if(!field) return;
    field.classList.toggle('is-invalid', !!msg);
    var err=field.querySelector('.field__err');
    if(!err && msg){
      err=document.createElement('div');
      err.className='field__err';
      field.appendChild(err);
    }
    if(err) err.textContent=msg||'';
  }
  function clearErrors(form){
    form.querySelectorAll('.is-invalid').forEach(function(el){el.classList.remove('is-invalid')});
    form.querySelectorAll('.field__err').forEach(function(el){el.textContent=''});
  }
  function statusBox(form, type, html){
    var box=form.querySelector('.form__status');
    if(!box){
      box=document.createElement('div');
      box.className='form__status';
      var btn=form.querySelector('button[type=submit]');
      if(btn && btn.parentNode) btn.parentNode.insertBefore(box, btn.nextSibling);
      else form.appendChild(box);
    }
    box.hidden=!html;
    box.classList.remove('form__status--ok','form__status--err');
    if(type) box.classList.add('form__status--'+type);
    box.innerHTML=html||'';
    return box;
  }

  function val(form, name){
    var el=form.elements[name];
    if(!el) return '';
    if(el.type==='checkbox') return !!el.checked;
    return (el.value||'').trim();
  }

  function clientValidate(form){
    var ok=true;
    clearErrors(form);
    var isPartner=form.getAttribute('data-form')==='partner';
    var nameField=form.querySelector('[name="'+(isPartner?'person':'name')+'"]');
    var nameWrap=nameField && nameField.closest('.field');
    var nameVal=nameField?(nameField.value||'').trim():'';
    if(!nameVal){fieldError(nameWrap,'Укажите, пожалуйста, имя');ok=false;}

    var phone=form.querySelector('[name="phone"]');
    var phoneWrap=phone && phone.closest('.field');
    if(!validPhone(phone && phone.value)){fieldError(phoneWrap,'Укажите номер телефона');ok=false;}

    if(isPartner){
      var company=form.querySelector('[name="company"]');
      if(company && !(company.value||'').trim()){fieldError(company.closest('.field'),'Укажите название компании');ok=false;}
    }

    var consent=form.querySelector('[name="consent"]');
    var check=consent && consent.closest('.check');
    if(!consent || !consent.checked){
      if(check) check.classList.add('is-invalid');
      ok=false;
    }
    return ok;
  }

  function payloadFrom(form){
    var cfg=window.INTERRIYA_FORM||{};
    var store=readUtmStore();
    var isPartner=form.getAttribute('data-form')==='partner';
    var pack=val(form,'pack');
    var area=parseInt(val(form,'area'),10);
    var started=form.getAttribute('data-started')||val(form,'started_at');
    var data={
      form: form.getAttribute('data-form')||'lead',
      page: (location.pathname.split('/').pop()||'index.html'),
      page_url: location.href,
      site_host: location.host||'localhost',
      name: isPartner?val(form,'person'):val(form,'name'),
      person: val(form,'person'),
      phone: val(form,'phone'),
      comment: val(form,'comment'),
      pack: pack,
      area: isNaN(area)?'':area,
      object: val(form,'object'),
      address: val(form,'address'),
      company: val(form,'company'),
      contact: val(form,'contact'),
      site: val(form,'site'),
      consent: !!(form.elements.consent && form.elements.consent.checked),
      started_at: started,
      website: val(form,'website'),
      utm: store.utm||{},
      referrer: store.referrer||document.referrer||'',
      site_name: cfg.siteName||'Интеррия. Пакетные решения'
    };
    return data;
  }

  function phoneLink(cfg){
    var pretty=(cfg && cfg.phone)||'+7 999 051-67-77';
    var tel=pretty.replace(/\D+/g,'');
    if(tel.charAt(0)==='8') tel='7'+tel.slice(1);
    if(tel.charAt(0)!=='7') tel='7'+tel;
    return '<a href="tel:+'+tel+'">'+pretty+'</a>';
  }

  function setSending(form, on){
    form.classList.toggle('is-sending', !!on);
    var btn=form.querySelector('button[type=submit]');
    if(!btn) return;
    if(!btn.getAttribute('data-label')) btn.setAttribute('data-label', btn.textContent);
    btn.disabled=!!on;
    btn.textContent=on?'Отправляем…':btn.getAttribute('data-label');
  }

  function bindForm(form){
    var started=String(Date.now());
    form.setAttribute('data-started', started);
    var hidden=form.querySelector('[name="started_at"]');
    if(hidden) hidden.value=started;
    bindPhoneMask(form.querySelector('[name="phone"]'));

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var cfg=window.INTERRIYA_FORM||{};
      var endpoint=cfg.endpoint||'send.php';
      statusBox(form, '', '');
      if(!clientValidate(form)){
        statusBox(form,'err','Проверьте, пожалуйста, поля формы.');
        return;
      }
      if(cfg.demo){
        statusBox(form,'err','Это демо-версия, заявки пока не отправляются');
        return;
      }
      setSending(form, true);
      var body=payloadFrom(form);
      fetch(endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(body)
      }).then(function(res){
        return res.json().catch(function(){return {ok:false,error:'send'};}).then(function(j){
          j=j||{};
          j._status=res.status;
          j._okhttp=res.ok;
          return j;
        });
      }).then(function(j){
        if(j && j.ok){
          form.classList.add('is-ok');
          statusBox(form,'ok','Спасибо! Заявка отправлена, мы свяжемся с вами.');
          /* Цель Метрики (подставить номер счётчика, когда заказчик его пришлёт):
             ym(XXXXXX, 'reachGoal', 'lead_submit'); */
          return;
        }
        if(j && j.error==='too_fast'){
          statusBox(form,'err','Форма отправлена слишком быстро. Подождите секунду и нажмите «Отправить» ещё раз.');
          form.setAttribute('data-started', String(Date.now()-4000));
          var h=form.querySelector('[name="started_at"]');
          if(h) h.value=form.getAttribute('data-started');
          return;
        }
        statusBox(form,'err','Не получилось отправить заявку. Позвоните нам: '+phoneLink(cfg));
      }).catch(function(){
        statusBox(form,'err','Не получилось отправить заявку. Позвоните нам: '+phoneLink(cfg));
      }).then(function(){
        setSending(form, false);
      });
    });
  }

  document.querySelectorAll('form.js-lead-form').forEach(bindForm);
})();


(function(){
  var pool=window.INTERRIYA_PROJECTS;
  var box=document.querySelector('.js-works');
  if(!pool || !pool.length || !box) return;

  function caption(p){
    if(!p) return '';
    if(p.source==='vk') return p.title || '';
    if(p.category==='Дизайн' || p.category==='Румтуры') return p.title || p.descr || '';
    var parts=[];
    if(p.descr) parts.push(p.descr);
    if(p.title && p.title!==p.descr) parts.push(p.title);
    return parts.join(' · ');
  }

  function shuffle(arr){
    var a=arr.slice(), i, j, t;
    for(i=a.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}
    return a;
  }

  function isInformative(p){
    var c=caption(p);
    return !!(c && c!=='Уточняем стоимость');
  }
  function pick(n, key){
    var usable=pool.filter(function(p){return p.photos && p.photos.length;});
    var preferred=usable.filter(isInformative);
    var source=preferred.length>=n?preferred:usable;
    var last=[];
    try{last=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}
    var seen={};
    last.forEach(function(id){seen[id]=1;});
    var fresh=source.filter(function(p){return !seen[p.id];});
    if(fresh.length<n) fresh=source;
    var chosen=shuffle(fresh).slice(0,n);
    try{localStorage.setItem(key, JSON.stringify(chosen.map(function(p){return p.id;})));}catch(e){}
    return chosen;
  }

  var n=parseInt(box.getAttribute('data-works-count'),10) || box.querySelectorAll('a.work').length;
  var key='interriya_v32_works_'+(box.getAttribute('data-works-key')||n);
  var cards=box.querySelectorAll('a.work');
  var chosen=pick(Math.min(n, cards.length), key);
  chosen.forEach(function(p,i){
    var a=cards[i]; if(!a) return;
    var cap=caption(p);
    a.href=p.url;
    var img=a.querySelector('img');
    if(img && p.photos[0]){
      img.src=p.photos[0];
      img.alt=cap?('Проект: '+cap):img.alt;
      img.loading=i===0?'eager':'lazy';
    }
    var el=a.querySelector('.work__cap');
    if(el && cap) el.textContent=cap;
  });
})();
