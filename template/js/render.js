// 24-09-2021

// TODO: пропонувати у налаштуваннях юзати кеш (локалСторедж)
// TODO: generate urls
// TODO: add zoom 
// TODO: перевірити крихти на кроці, коли малюється графік (не показує назву!)
// TODO: додати назву ону в графік


// крихти
const breadcrumbs = document.getElementById('breadcrumbs');

// блок виводу основної інформації для адміністраторів
const output = document.getElementById('output');


// глобальний масив з об'єктами, в який пушимо значення при переході в глибину
// видаляємо значення при кліку по елементу хлібних крихт
// рендер хлібних крихт і контенту на сторінці по кожній зміні
const global = [];

// TODO: додати лінк на поточну сторінку global
// TODO: додати SEO-LINK (get-параметри)

// початкові дані (при вході в адмінку)
const origin = {
    name: 'Початок',
    cls: 'one-block',
    level: '0',
    data: '<h1>Початок</h1><p>Тут буде виводитися якась стартова інформація</p>',
};

// вставляємо початкові дані
global[0] = origin;

// початковий рендер крихт:
renderBreadcrumbs();

// ... та контенту:
renderOutput();

// клік на пункт меню у сайдбарі
// TODO: перевірити, чи буде працювати без плагіна скрола (скоротити код)
const asideLink = document.querySelectorAll('#scroll p');
const asideLength = asideLink.length;

for(let el = 0; el < asideLength; el++){

    asideLink[el].addEventListener('click', function(event) {
        
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

                window.location.href = 'login-panel.html';
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
                }
                break;

            default: console.log('Порожній пункт');
        }

        // close search
        searchForm.classList.remove('active');

    }); // 'click'
}

// клік на елемент в аутпуті
output && output.addEventListener('click', event => {

    // debug
    // console.log(global)

    // клік має бути на елементі, а не на цілому блоці
    if(event.target.classList.contains('output-item')){

        // отримуємо дата-атрибут для перевірки
        const level = event.target.dataset.level;

        // айді поточного блоку (ітема)
        const id = event.target.dataset.id;

        // назва сторінки, де знаходимося!
        const name = event.target.dataset.name

        switch(level){

            // home (а якщо раптом несподівано потрапимо на початкову інфу о_О)
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

                fetch(`https://api.bill.lviv.ua/api/monitoring/devices/${id}/objects`, {
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
                    
                    // назва сторінки, де знаходимося!
                    // const name = event.target.dataset.name;

                    let data = '';
        
                    for(let i = 0; i < devices.data.length; i++){

                        const item = devices.data[i];
        
                        data += `
                            <div 
                                class="output-item output-item-wrapper"
                                data-id="${item.id}"
                                data-name="${item.name}"
                                data-level="2">
                                    <p class="flex">
                                        <i class="${checkStatus(item.status)}"></i> 
                                        ${item.name} 
                                        <span class="to-right">${item.children_count}</span>
                                    </p>
                                    <!-- <p>debug, id - ${item.id}</p> -->
                            </div>`.replace(/\s{2,}/g, ' ');

                        hideLoader();
                    }
                    
                    // оновлюємо конкретний елемент масива global[level]
                    global[2] = {
                        name,
                        cls: 'grid-4',
                        level: '2',
                        data
                    }

                    // виводимо на сторінці
                    renderOutput();

                    // render breadcrumbs
                    renderBreadcrumbs();  
                })
                .catch(error => checkError(error));

                break;

            case '2':

                showLoader();

                fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/children`, {
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
                        
                        // check status for enabled laser and ethernet
                        const parentStatus = item.status;

                        // Сигнал
                        let rxpower = '';

                        if(item.meta_data.rxpower !== undefined){

                            const r = item.meta_data.rxpower;

                            if(r < -16 && r >= -24){

                                // green color
                                rxpower = `<p class="signal color-green parent-status-${parentStatus}"><span>${r} dB</span></p>`;
                            } else if(r < -24 && r > -28){

                                // yellow
                                rxpower = `<p class="signal color-yellow parent-status-${parentStatus}"><span>${r} dB</span></p>`;
                            } else {

                                // default
                                rxpower = `<p class="signal parent-status-${parentStatus}"><span>${r} dB</span></p>`;
                            }
                        }
        
                        // виводимо левел тільки тоді, коли є вона активна
                        data += `
                            <div 
                                class="output-item output-item-wrapper"
                                data-id="${item.id}"
                                data-name="${item.name}"
                                ${item.status == '1' ? 'data-level="3"' : ''}>
                                    <p class="flex">
                                        <i class="${checkStatus(item.status)}"></i> 
                                        ${item.name} 
                                        <span class="to-right">${item.children_count > 4 ? 'bug: ' + item.children_count : ''}</span>
                                    </p>

                                    <hr>

                                    <p>Причина дереєстрації: 
                                        <span>${item.meta_data.deregreason !== undefined ? `${item.meta_data.deregreason}` : 'Немає даних'}</span></p>
                                        
                                    <p>Останній час дереєстрації: 
                                        <span>${item.meta_data.deregtime !== undefined ? `${item.meta_data.deregtime}` : 'Немає даних'}</span></p>

                                    <p>${rxpower}</p>
                            </div>`.replace(/\s{2,}/g, ' ');

                        hideLoader();
                    }
                    
                    // оновлюємо конкретний елемент масива global[level]
                    global[3] = {
                        name,
                        cls: 'grid-4',
                        level: '3',
                        data
                    }

                    // виводимо на сторінці
                    renderOutput();

                    // render breadcrumbs
                    renderBreadcrumbs();  
                })
                .catch(error => checkError(error));

                break;

            case '3': 

            showLoader();
            
            fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower`, {
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
                
                // вкидаємо масив значень + назву ону, виводимо
                renderCharts(devices, name, 'LTS', id);

                // render breadcrumbs
                renderBreadcrumbs();

                // оновлюємо конкретний елемент масива global[level]
                global[4] = {
                    name,
                    cls: 'one-block bg-white',
                    level: '4',
                    data: '' // -empty-
                }

                hideLoader();
                
            })
            .catch(error => checkError(error));

            break;

            // else
            default: '';
        }
    } else if(event.target.classList.contains('charts-item')){ // якщо клік на кнопці рендерингу графіка

        // дата-атрибут за який період показувати дані
        const date = event.target.dataset.date;

        // айді поточного блоку (ітема)
        const id = event.target.dataset.id;

        // назва сторінки, де знаходимося!
        const name = event.target.dataset.name

        // різні дати для обробки
        const d = new Date();
        const day = d.getDay();
        const month = d.getMonth();
        // TODO: перевірити на останній/попередній місяць у році
        const previousMonth = d.getMonth() - 1;
        // TODO: перевірити
        const quarter = d.getMonth() - 3;
        const year = d.getFullYear();
        // TODO: перевірити
        const previousYear = d.getFullYear() - 1;

        switch(date){

            // нинішня статистика
            case 'day': 

                showLoader();
            
                fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower`, {
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
                    
                    renderCharts(devices, name, 'LTS', id);

                    // render breadcrumbs
                    renderBreadcrumbs();

                    // edit
                    global[5] = {
                        name,
                        cls: 'one-block bg-white',
                        level: '4',
                        data: '' // -empty-
                    }

                    hideLoader();

                })
                .catch(error => checkError(error));

                break;

            // за місяць (до нині)
            case 'month': 

                showLoader();
                
                fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower?startDt=${year}-${previousMonth}-${day}T00%3A00%3A00`, {
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

                    renderCharts(devices, name, 'l', id);

                    // edit
                    global[5] = {
                        name,
                        cls: 'one-block bg-white',
                        level: '4',
                        data: '' // -empty-
                    }

                    hideLoader();

                })
                .catch(error => checkError(error));

                break;

            // за квартал (до нині)
            case 'quarter':
            
                showLoader();
                
                fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower?startDt=${year}-${quarter}-${day}T00%3A00%3A00`, {
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
                    
                    renderCharts(devices, name, 'l', id);

                    // edit
                    global[5] = {
                        name,
                        cls: 'one-block bg-white',
                        level: '4',
                        data: '' // -empty-
                    }

                    hideLoader();

                })
                .catch(error => checkError(error));
            
                break;

            // за рік (до нині)
            case 'year':

                showLoader();
                
                fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower?startDt=${previousYear}-${month}-${day}T00%3A00%3A00`, {
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
                    
                    renderCharts(devices, name, 'l', id);

                    // edit
                    global[5] = {
                        name,
                        cls: 'one-block bg-white',
                        level: '4',
                        data: '' // -empty-
                    }

                    hideLoader();

                })
                .catch(error => checkError(error));
            
            break;

            // це не тре
            default: '';

        }
    }
});

// вибірка за айдішкою без її створення працює, це не хак, це фіча!
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










function randomString(length = 7) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


// TODO: графіків буде кілька

/**
 * @param {*} devices -- дані, які приходять і будуть оброблятися 
 * @param {*} label -- назва девайса
 * @param {*} dateFormat -- тип дати || 'LT' -- година/хвилина || 'LTS' -- година/хвилина/секунда || 'llll' -- вт. 26 жовт 2021 р., 11:59
 * @param {*} id
 */
function renderCharts(devices = 0, label = 'noname', dateFormat = 'LT', id){

    // якщо айдішка загубилася -- все решта не має сенсу
    if(id === undefined){
        return;
    }

    // дані зі запиту, які мають бути виведені у графіку
    const data = []; 
    const labels = []; 
    
    for(const item in devices){
        
        // параметр
        data.push(devices[item]);

        // час
        labels.push(moment(item).format(dateFormat));
    }  

    // генеруємо унікальну айдішку для графіка
    const chartName = randomString();

    // const canvas = document.createElement('canvas');
    // canvas.id = chartName;
    // output.append(canvas);

    // output.innerHTML = '';

    output.innerHTML = `
        <div id="charts-select">
            <div data-date="day" data-id="${id}" class="charts-item">Нині</div>
            <div data-date="month" data-id="${id}" class="charts-item">Місяць</div>
            <div data-date="quarter" data-id="${id}" class="charts-item">Квартал</div>
            <div data-date="year" data-id="${id}" class="charts-item">Рік</div>
        </div>
        <canvas id="${chartName}"></canvas>
    `;

    output.className = 'one-block bg-white';

    const ctx = document.getElementById(chartName);

    const myChart = new Chart(ctx, 
        {
            type: 'line', // 'doughnut', 'bar', 'radar', 'bubble', 'scatter', 'pie', 'polarArea'
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    borderWidth: 1,
                    borderColor: 'red'
                }]
            },

            options: {
                plugins: {



                  zoom: {
                    zoom: {
                      wheel: {
                        enabled: true,
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',                        
                    }
                  }
                }
            }    
        }
    );
}

// відмальовує хлібні крихти
function renderBreadcrumbs(){

    const length = global.length;
    // const breadcrumbs = document.getElementById('breadcrumbs');

    // clear
    breadcrumbs && (breadcrumbs.innerHTML = '');

    let tmp = '';

    for(let i = 0; i < length; i++){

        tmp += `<li><p data-level="${global[i].level}">${global[i].name}</p></li>`;
    }

    breadcrumbs && (breadcrumbs.innerHTML = tmp);
}

// відмальовує контент на сторінці, використовуючи останній елемент глобала
function renderOutput(){

    if(global.length > 0){

        // останній елемент масива глобал
        const last = global[global.length-1];
    
        output && (output.innerHTML = last.data);
        output && (output.className = last.cls);
    } else {

        output.innerHTML = '<h1>Вихід зі системи</h1><p>TODO: переадресація</p>';
        output.className = 'one-block';
    }

}

// check devices
function isTouchDevice() {

    // true if not desktop
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}

// catch all error
function checkError(err) {

    switch(err){
        case 400: message = 'Bad request'; break;
        case 401: message = 'Unauthenticated'; break;
        case 403: message = 'Forbidden'; break;
        case 404: message = 'Not Found'; break;
        case 422: message = 'Неправильний логін і/або пароль!'; break;
        default: message = err;
    }      
    
    if(document.getElementById('login-panel-content')){
        
        // login-panel
        document.getElementById('login-panel-content').innerHTML = `<p class="flex-center">${message}</p>`;
    } else {

        // admin-panel
        output.innerHTML = `<p class="flex-center">${message}</p>`;
    }

    // може ліпше повертати message?
}

// change status
function checkStatus(s){

    let status;
    switch(s){
        case 0: status = 'gray'; break; // disabled
        case 1: status = 'green'; break; // up
        case 2: status = 'tomato'; break; // down
        case 3: status = 'gray'; break; // partially down (not in use now)
        default: status = 'orange';
    }

    return status;
}

// show loader
function showLoader(modified = null){

    loader.classList.add('active');
    
    // додатковий модифкатор для зміни позиціонування
    if(modified !== null){

        loader.classList.add(modified);
    }
}

// hide (по дефолту лоудер схований)
function hideLoader(){

    loader.className = '';
}

// 27-10-2021

