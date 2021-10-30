
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
        // labels.push(moment(item).format(dateFormat));
        labels.push('');
    }  

    // генеруємо унікальну айдішку для графіка
    const chartName = randomString();

    //  data-id="${id}"
    //  style="text-align:center"
    output.innerHTML = `
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

            fetch(`https://api.bill.lviv.ua/api/monitoring/objects/${id}/metric/rxPower?startDt=${prev}&endDt=${next}`, 
                {
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
                    
                    // TODO: замінити/доопрацювати рекурсію
                    renderCharts(devices, name, 'LTS', id);
                })
                .catch(error => checkError(error));
        }
    );

    output.className = 'one-block bg-white';

    const ctx = document.getElementById(chartName);

    Chart.defaults.scales.linear.min = 0;
    Chart.defaults.scales.linear.max = -32;

    const myChart = new Chart(ctx, 
        {
            type: 'line', // 'doughnut', 'bar', 'radar', 'bubble', 'scatter', 'pie', 'polarArea'
            data: {
                labels,
                datasets: [{
                    label,
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