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
                        data: '<h1>Акаунт</h1><p>Тут буде виводитися якась інформація щодо налаштувань акаунта</p>',
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


        // // отримуємо дата-атрибут для перевірки
        // const level = event.target.dataset.level;

        // // айді поточного блоку (ітема)
        // const id = event.target.dataset.id;

        // // назва сторінки, де знаходимося!
        // const name = event.target.dataset.name



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
                    renderCharts(devices, name, 'llll', id);

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
    } 
    

    // // якщо клікнули у поле дейт-пікера
    // else if(event.target.id === 'datetimerange'){

    //     // айді поточного блоку (ітема)
    //     const id = event.target.dataset.id;

    //     // назва сторінки, де знаходимося!
    //     const name = event.target.dataset.name

    //     // const id = event.target.dataset.id;

    //     // calendar(id,name);

    //     // global[5] = {
    //     //     name,
    //     //     cls: 'one-block bg-white',
    //     //     level: '5',
    //     //     data: '' // -empty-
    //     // }

    //     new DateRangePicker('datetimerange', {
    //             timePicker: true,
    //             opens: 'left',
    //             ranges: {
    //                 'Нині': [moment().startOf('day'), moment().endOf('day')],
    //                 'Вчора': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
    //                 'Тиждень': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
    //                 'Місяць': [moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day')],
    //                 'Квартал': [moment().subtract(3, 'month').startOf('day'), moment().endOf('month').endOf('day')],
    //                 'Рік': [moment().subtract(1, 'year').startOf('day'), moment().endOf('month').endOf('day')],
    //             },
    //             autoUpdateInput: true,
    //             locale: {
    //                 format: "YYYY-MM-DD HH:mm:ss",
    //             }
    //         },
    //         function (start, end) {
    
    //             const prev = start.format();
    //             const next = end.format();

    //             console.log(prev, next);
    //         }
    //     );
    
    
    // }


/*

    else if(event.target.classList.contains('charts-item')){ // якщо клік на кнопці рендерингу графіка

        // console.log(calendar())

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
*/

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











// 29-10-2021