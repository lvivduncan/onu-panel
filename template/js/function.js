

// генерує вибадковий рядок
function randomString(length = 7) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


// TODO: after change value not correct

/**
 * @param {*} devices -- дані, які приходять і будуть оброблятися 
 * @param {*} dateFormat -- тип дати || 'LT' -- година/хвилина || 'LTS' -- година/хвилина/секунда || 'llll' -- вт. 26 жовт 2021 р., 11:59
 * @param {*} id
 */
function renderCharts(devices = 0, dateFormat = 'LT', id){ // label del

    // якщо айдішка загубилася -- все решта не має сенсу
    if(id === undefined){
        return;
    }

    // дані зі запиту, які мають бути виведені у графіку
    const data = []; 
    const labels = []; // не виводимо, буде пустий масив
    
    for(const item in devices){
        
        // параметр
        data.push(devices[item]);

        // час
        // labels.push(moment(item).format(dateFormat));
        labels.push('');
    }  

    // генеруємо унікальну айдішку для графіка
    const chartName = randomString();

    // // робимо запит, щоб отримати дані по айдішці та вивести ці дані над графіком
    // const onuSmallData = getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}`)

    // console.log(testOnu(onuSmallData), onuSmallData)

    // const onuHeader = onuSmallData
    //     .then(devices => {
    //         return `
    //             <div class="onu-small-data">
    //                 <p>name: ${devices.name}</p>
    //                 <p>rxpower: ${devices.meta_data.rxpower}</p>
    //                 <p>last_pooling_at: ${devices.meta_data.last_pooling_at}</p>
    //                 <p>mac: ${devices.mac}</p>
    //                 <p>id: ${devices.id}</p>
    //             </div>`
    //         }
    //     )


    // .then(devices => getOnuSmallData(devices))









    console.log(getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}`).then(data => {
        return data;
    }))

    output.innerHTML = `
        ${getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}`).then(data => {
            return data;
        })}

        <input type="text" id="datetimerange">

        <canvas id="${chartName}"></canvas>
    `;

        new DateRangePicker('datetimerange', {
            timePicker: true,
            opens: 'left',
            ranges: {
                'Нині': [moment().startOf('day'), moment().endOf('day')],
                'Вчора': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                'Тиждень': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
                'Місяць': [moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day')],
                'Квартал': [moment().subtract(3, 'month').startOf('day'), moment().endOf('month').endOf('day')],
                'Рік': [moment().subtract(1, 'year').startOf('day'), moment().endOf('month').endOf('day')],
            },
            autoUpdateInput: true,
            locale: {
                format: "YYYY-MM-DD HH:mm:ss",
            }
        },
        function (start, end) {

            const prev = start.format().slice(0,10) + 'T00%3A00%3A01Z';
            const next = end.format().slice(0,10) + 'T23%3A59%3A59Z';

            getJSON(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower?startDt=${prev}&endDt=${next}`)

            .then(devices => {
                
                // TODO: замінити/доопрацювати рекурсію
                renderCharts(devices, 'LTS', id);
            })
            .catch(error => checkError(error));
        }
    );

    output.className = 'one-block';

    const ctx = document.getElementById(chartName);

    // максимальне значення графіка, яке відображається
    Chart.defaults.scales.linear.min = 0;

    // мінімальне значення графіка, яке відображається
    Chart.defaults.scales.linear.max = -32;

    // колір у вертикальній графі
    Chart.defaults.color = '#42a5f5';

    const myChart = new Chart(ctx, 
        {
            type: 'line', // 'doughnut', 'bar', 'radar', 'bubble', 'scatter', 'pie', 'polarArea'
            data: {
                labels,
                datasets: [{
                    // label,
                    data,
                    borderWidth: 2,
                    borderColor: '#337ab7',
                    pointRadius: 0
                }],
            },

            options: {
                plugins: {

                    // сховав назву з графіка
                    legend: {
                        display: false
                    },

                // zoom, scroll and touch
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

        output.innerHTML = '<h1>Вихід зі системи</h1>';
        output.className = 'one-block';
    }

    // // debug
    // console.log(global)

}

// check devices (del?)
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

        // alert(message)
        
        // login-panel
        document.getElementById('login-panel-content').innerHTML = `<p class="flex-center">${message}</p>`;
    } else {

        // admin-panel
        output.innerHTML = `<p class="flex-center">${message}</p>`;
    }
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

// 1 частина обробки запиту
async function getJSON(link){

    try{

        const data = await fetch(link, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
        });

        if (data.status === 200) {

            return await data.json();
        } else {

            const error = data.status;            
            throw error;
        }

    } catch(error){

        console.error('error: ', error)
    }
}

// 2 крок -- обладнання (початкові точки)
function getDevices(devices, name){

    let data = '';

    for(let i = 0; i < devices.data.length; i++){

        const item = devices.data[i];

        data += `
            <div 
                class="output-item output-item-wrapper"
                data-id="${item.id}"
                data-name="${item.name}"
                ${item.status == '1' ? 'data-level="2"' : ''}>
                    <p class="flex">
                        <i class="${checkStatus(item.status)}"></i> 
                        ${item.name} 
                        <span class="to-right">${item.children_count}</span>
                    </p>
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
}

// 3/4 крок -- ону
function getOnu(devices, name, id){ // id?
                    
    let data = '';

    for(let i = 0; i < devices.data.length; i++){

        const item = devices.data[i];
        
        // check status for enabled laser and ethernet
        const parentStatus = item.status;

        // назва 
        let ethernet = '';

        // TODO: теоретично їх може бути більше 1

        // якщо активно
        if(item.children_count > 0){

            // якщо ону не відключена, чЕкаємо статус порта
            if(parentStatus != 1){

                ethernet = `<p class="port status-0"><span>${item.children[0].name}</span></p>`;

            } else {
                
                ethernet = `<p class="port status-${item.children[0].status}"><span>${item.children[0].name}</span></p>`;
            }

        }

        // Сигнал
        let rxpower = '';

        if(item.meta_data.rxpower !== undefined){

            const r = item.meta_data.rxpower;

            // якщо ону не відключена, чЕкаємо статус порта
            if(parentStatus != 1){

                rxpower = `<p class="signal color-gray parent-status-${parentStatus}"><span>${r} dB</span></p>`;
            } else if(r < -16 && r >= -24){

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

                    ${rxpower}
                    ${ethernet}
            </div>`.replace(/\s{2,}/g, ' ');

        hideLoader();
    }
    
    // оновлюємо конкретний елемент масива global[level]
    global[3] = {
        name,
        cls: 'grid-4',
        level: '3',
        data,

        additional: id // сюди тре класти id елемента, на який клікнули?
    }

    // виводимо на сторінці
    renderOutput();

    // render breadcrumbs
    renderBreadcrumbs();  
}

// 5 крок -- метрика
function getMetric(devices, name, id){
    
    // вкидаємо масив значень + назву ону, виводимо
    renderCharts(devices, 'llll', id); // renderCharts(devices = 0, dateFormat = 'LT', id)

    // оновлюємо конкретний елемент масива global[level]
    global[4] = {
        name,
        cls: 'one-block bg-white',
        level: '4',
        //data: '-empty data-', // сюди писати дані елемента? 
        data: id
    }

    // render breadcrumbs
    renderBreadcrumbs();

    // hide loader
    hideLoader();
}

// // коли виводиться 5 крок (графік), потрібно вивести дані по ону, для якого і виводиться графік
// function getOnuSmallData(devices){

//     // console.log(devices.name, devices.meta_data.rxpower, devices.meta_data.last_pooling_at, devices)

//     return `
//         <div class="onu-small-data">
//             <p>name: ${devices.name}</p>
//             <p>rxpower: ${devices.meta_data.rxpower}</p>
//             <p>last_pooling_at: ${devices.meta_data.last_pooling_at}</p>
//             <p>mac: ${devices.mac}</p>
//             <p>id: ${devices.id}</p>
//         </div>`;
// }

function testOnu(onu){

    return onu.name;
}