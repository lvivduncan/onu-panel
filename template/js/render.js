// 24-09-2021


// TODO: глобальне оновлення від 2-11-2021
// глобал повинен зберігати дані по кліку не тільки 1 елемента, а одразу всі вкладені!


// TODO: пропонувати у налаштуваннях юзати кеш (локалСторедж)
// TODO: generate urls

// TODO: приховати з крихт "Початок" та "Обладнання"

// крихти
const breadcrumbs = document.getElementById('breadcrumbs');

// блок виводу основної інформації для адміністраторів
const output = document.getElementById('output');

// глобальний масив з об'єктами, в який пушимо значення при переході в глибину
// видаляємо значення при кліку по елементу хлібних крихт
// рендер хлібних крихт і контенту на сторінці по кожній зміні
const global = [];


// передача даних про елемент (і це дуже погано)
let testData = '';
// TODO: видалити, бо це діч! 


// TODO: додати лінк на поточну сторінку global
// TODO: додати SEO-LINK (get-параметри)

// початкові дані (при вході в адмінку)
const origin = {
    name: 'Початок',
    cls: 'one-block',
    level: '0',
    data: '<h1>Початок</h1><p>Тут буде виводитися якась стартова інформація</p>',
    // additional: '',
};

// вставляємо початкові дані
global[0] = origin;

// початковий рендер крихт:
breadcrumbs && renderBreadcrumbs();

// ... та контенту:
output && renderOutput();

// клік на пункт меню у сайдбарі
const asideLink = document.querySelectorAll('#scroll p');
const asideLength = asideLink.length;

for(let el = 0; el < asideLength; el++){

    asideLink[el].addEventListener('click', function(event) {
        
        /*
        // if this mobile divice -- toggle panel (hide)
        if(isTouchDevice()){

            // if adminPanel open (exists class .toggle) -- close
            if(adminPanel.classList.contains('toggle')){

                adminPanel.classList.remove('toggle');

                for(let i = 0; i < spans.length; i++){

                    spans[i].classList.remove('toggle');
                }
            }
        }
        */

        // stylization links
        for(let i = 0; i < asideLength; i++){
            
            // remove class 
            asideLink[i].classList.remove('active');

            // set class 
            this.classList.add('active');
        }

        // отримуємо дата-атрибут для перевірки
        const level = event.currentTarget.dataset.level;

        // чЕкаємо на який елемент клікнули (3 варіанти -- 0, 1 і "вихід")
        switch(level){

            // вихід
            case 'exit': 

                // очищаємо глобал і виходимо зі системи
                global.length = 0;

                window.location.href = 'index.html';
                localStorage.clear();

                // виводимо на сторінці
                renderOutput();

                // render breadcrumbs
                renderBreadcrumbs();   
                break;

            // головна
            case '0': 

                global.length = 0; 

                // завантажуємо початкові дані
                global[0] = origin;

                // виводимо на сторінці
                renderOutput();

                // render breadcrumbs
                renderBreadcrumbs();   
                break;

            // обладнання, налаштування, менеджери тощо
            case '1': 

                // дата-атрибут 
                const name = event.currentTarget.dataset.name;

                if(name === 'Обладнання'){

                    showLoader();

                    // початковий запит даних
                    fetch('https://api.bill.lviv.ua/api/monitoring/devices', {
                        method: "GET",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                        },
                    })
                    .then(res => {
                        if (res.status === 200) {
        
                            return res.json();
                        } else {
        
                            error = res.status;
                            throw error;
                        }
                    })
                    .then(devices => {
        
                        let data = '';
        
                        for(let i = 0; i < devices.data.length; i++){
        
                            const item = devices.data[i];

                            data += `
                                <div 
                                    class="output-item"
                                    data-level="1"
                                    data-name="${item.name}"
                                    data-id="${item.id}">
                                        <i class="${checkStatus(item.status)}"></i> ${item.name}
                                </div>`.replace(/\s{2,}/g, ' ');
                            
                            // знищувати наступні елементи масива!
                            global.length = 2;

                            // оновлюємо конкретний елемент масива global[level]
                            global[1] = {
                                name: 'Обладнання',
                                cls: 'grid-4',
                                level: '1',
                                data
                            }

                            // виводимо на сторінці
                            renderOutput();

                            // render breadcrumbs
                            renderBreadcrumbs();

                            hideLoader();
                        }
                    })
                    .catch(error => checkError(error));


                } else if(name === 'Налаштування'){

                    // знищувати наступні елементи масива!
                    global.length = 2;

                    // оновлюємо конкретний елемент масива global[level]
                    global[1] = {
                        name: 'Налаштування',
                        cls: 'one-block',
                        level: '1',
                        data: '<h1>Налаштування</h1><p>Тут буде виводитися якась інформація щодо налаштувань</p>',
                    }

                    // виводимо на сторінці
                    renderOutput();

                    // render breadcrumbs
                    renderBreadcrumbs();   
                } else if(name === 'Акаунт'){

                    // знищувати наступні елементи масива!
                    global.length = 2;

                    // оновлюємо конкретний елемент масива global[level]
                    global[1] = {
                        name: 'Акаунт',
                        cls: 'one-block',
                        level: '1',
                        data: `
                            <h1>Акаунт</h1>
                            <p>Тут буде виводитися якась інформація щодо налаштувань акаунта</p>
                            <div id="color-mode">
                                <em>light</em><span></span><em>dark</em>
                            </div>`,
                    }

                    // виводимо на сторінці
                    renderOutput();

                    // render breadcrumbs
                    renderBreadcrumbs();
                }

                break;

            default: console.log('Порожній пункт');
        }

        // close search
        // searchForm.classList.remove('active');

    }); // 'click'
}

// клік на елемент в аутпуті
output && output.addEventListener('click', event => {

    // клік має бути на елементі, а не на цілому блоці (обладнання)
    if(event.target.classList.contains('output-item')){

        // отримуємо дата-атрибут для перевірки
        const level = event.target.dataset.level;

        // айді поточного блоку (ітема)
        const id = event.target.dataset.id;

        // назва сторінки, де знаходимося!
        const name = event.target.dataset.name

        switch(level){

            // home (якщо раптом несподівано потрапимо на початкову інфу о_О)
            case '0':

                global.length = 0; 

                // завантажуємо початкові дані
                global[0] = origin;

                // виводимо на сторінці
                renderOutput();

                // render breadcrumbs
                renderBreadcrumbs();   
                break;

            case '1':

                showLoader();

                getJSON(`https://api.bill.lviv.ua/api/monitoring/devices/${id}/objects`)

                .then(devices => getDevices(devices, name))

                .catch(error => checkError(error));

                break;

            case '2':

                showLoader();

                getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/children?children=1`)

                // .then(devices => getOnu(devices, id, name))
                .then(devices => getOnu(devices, name, id))

                .catch(error => checkError(error));

                break;

            case '3': 

                showLoader();

                // small data onu
                const test1 = getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}`)
                .then(devices => {
                    return devices;
                })

                const test2 = getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower`)
                
                .then(devices => getMetric(devices, name, id, dataOnu))

                Promise.all([test1, test2])
                .then(value => console.log(value))

                .catch(error => checkError(error));

                break;

            // else
            default: '';
        }
    } 

});

// клік на хлібних крихтах
breadcrumbs && breadcrumbs.addEventListener('click', event => {

    if(event.target.tagName === 'P'){

        // номер елемента у хлібних крихтах
        const level = event.target.dataset.level;

        // модифікуємо глобал
        global.length = level * 1 + 1;

        // опрацьовуємо дані глобала і рендеримо крихти:
        renderBreadcrumbs();

        // ... та контент на сторінці:
        renderOutput();
    }
});

// 03-11-2021




/* 
fetch(`https://api.bill.lviv.ua/api/monitoring/objects/257/children?children=1
`, {
    method: "GET",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    },
})
.then(res => {
    if (res.status === 200) {

        return res.json();
    } else {

        error = res.status;
        throw error;
    }
})
.then(devices => {
    
    console.log('257: ', devices)

})
.catch(error => checkError(error));
 */

/* 
fetch(`https://api.bill.lviv.ua/api/monitoring/objects/253/children`, {
    method: "GET",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    },
})
.then(res => {
    if (res.status === 200) {

        return res.json();
    } else {

        error = res.status;
        throw error;
    }
})
.then(devices => {
    
    console.log('253: ', devices)

})
.catch(error => checkError(error));
 */

/* 
fetch(`https://api.bill.lviv.ua/api/monitoring/objects/257/metric/rxPower`, {
    method: "GET",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    },
})
.then(res => {
    if (res.status === 200) {

        return res.json();
    } else {

        error = res.status;
        throw error;
    }
})
.then(devices => {

    console.log(devices);
            
})
.catch(error => checkError(error));
 */

/* 
let str1 = new String('str1');
let str2 = String('str2');
let str3 = String();

console.log(str1)
console.log(str2)
console.log(str3)

str1 =+ 'a';
str2 =+ 'b';
str3 =+ 'c';

console.log(str1)
console.log(str2)
console.log(str3)
 */