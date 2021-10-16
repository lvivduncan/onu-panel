// 24-09-2021

const body = document.getElementsByTagName('body')[0];

// хлібні крихти
const breadcrumbs = document.getElementById('breadcrumbs');

// елементи хлібних крихт (по кліку на aside/#output мають оновлюватися)
let breadcrumbsLi;

// 3 рівень вкладення -- клік на 1 елемент обладнання
let level3 = '';

let level4 = '';

// output data
const output = document.getElementById('output');

// view/hide password input
const passwordView = document.querySelector('#label-password .view');
const passwordInput = document.querySelector('#label-password input');

// search mobile button
const searchMobile = document.querySelector('#search > svg');
const searchForm = document.querySelector('#search form');
searchMobile && searchMobile.addEventListener('click', () => {

    searchForm.classList.toggle('active');
});

// показати/сховати пароль
passwordView && passwordView.addEventListener('click', () => {

    passwordView.classList.toggle('active');

    if(passwordInput.getAttribute('type') === 'password'){

        passwordInput.setAttribute('type', 'text');
    } else {
        
        passwordInput.setAttribute('type', 'password');
    }    
});

// відновлення пароля (TODO: елемент з'являється, якщо юзер є у системі)
const resetPassword = document.getElementById('reset-password');
resetPassword && resetPassword.addEventListener('click', event => {

    event.preventDefault();

    resetPassword.innerText = 'Новий пароль надіслано!';
    resetPassword.className = 'active';

    setTimeout(() => {
        
        resetPassword.innerText = 'Забули пароль?';
        resetPassword.className = '';
    }, 2000);
});

// перемикач кольорів
const colorMode = document.getElementById('color-mode');
if(colorMode !== null){

    const colorModeSpan = colorMode.querySelector('span');

    if(localStorage.colorMode == 1){

        body.setAttribute('id', 'dark-mode');
        colorMode && colorMode.classList.add('active');
    }
    
    colorMode && colorModeSpan.addEventListener('click', () => {
    
        colorMode.classList.toggle('active');
    
        if(body.getAttribute('id') === 'dark-mode'){
    
            body.removeAttribute('id');
            
            localStorage.removeItem('colorMode');
        } else {
    
            body.setAttribute('id', 'dark-mode');
            localStorage.colorMode = 1;
        }
    });
}

// mobile-menu (toggle sidebar)
const adminPanel = document.getElementById('admin-panel');
if(adminPanel !== null){

    // mobile button
    const menuButton = adminPanel.querySelector('#menu-button');

    // all section block
    const adminSection = adminPanel.querySelector('section');

    // aside nav
    const nav = adminPanel.querySelector('aside ul');

    // nav elements name
    const spans = nav.querySelectorAll('span');
    
    // if click to menu button -- toggle 
    menuButton.addEventListener('click', () => {
    
        adminPanel.classList.toggle('toggle');

        for(let i = 0; i < spans.length; i++){

            spans[i].classList.toggle('toggle');
        }
    });

    // if click to section -- remove (open)
    adminSection.addEventListener('click', () => {

        adminPanel.classList.remove('toggle');

        for(let i = 0; i < spans.length; i++){

            spans[i].classList.remove('toggle');
        }

        // close search
        searchForm.classList.remove('active');
    });
}

// check form
{
    const form = document.querySelector('#login-panel form');

    let error;

    form && form.addEventListener('submit', e => {
        e.preventDefault();

        fetch('https://api.bill.lviv.ua/api/auth', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ 'uname' : form.querySelector('[name="uname"]').value, 'password' : form.querySelector('[name="password"]').value })
        })
        .then(res => {
            if (res.status >= 200 && res.status < 300) {

                return res.json();
            } else {

                error = res.status;
                throw error;
            }
        })
        .then(data => {

            document.getElementById('login-panel-content').innerHTML = '<p class="flex-center">Успішний вхід у систему!</p>';

            setTimeout(() => {

                window.location.href = "./admin-panel.html";
            }, 1000);
    
            localStorage.setItem('access_token', data.token);
        })
        .catch(error => checkError(error));

    });
/* 
    document.getElementById('get-user-data') && document.getElementById('get-user-data').addEventListener('click', e => {
        e.preventDefault();

        fetch('https://api.bill.lviv.ua/api/auth', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            method: "GET",
        })
            .then(res => {
                if (res.status === 200)
                    return res.json();
                else console.error('Error fetch data; http status code = ' + res.status);
            })
            .then(data => {

                console.log('User data ' + data);
                document.getElementById('user_data').innerText = JSON.stringify(data);
            })
            .catch(error => console.error(error));
    });
     */
}

// проміжна перемінна для хлібних крихт
let devices_parent = null;

/**
 * @aside 
 * click aside nav element
 * 
 */

const asideLink = document.querySelectorAll('#scroll p');
const asideLength = asideLink.length;

for(let el = 0; el < asideLength; el++){

    asideLink[el].addEventListener('click', function(event) {

        const spans = document.querySelectorAll('aside span');
        
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

        // get href aside element
        const href = event.currentTarget.dataset.href;

        // get title aside element
        const titles = event.currentTarget.dataset.titles;

        // if not home
        const paths = event.currentTarget.dataset.paths;

        // render content in #output
        render(href);

        // upgrade breadcrumbs
        route(href,paths,titles);

        // update list
        breadcrumbsLi = breadcrumbs.querySelectorAll('li');

        // close search
        searchForm.classList.remove('active');
    });
}

/**
 * 
 * @main
 * click #output element
 * 
 */

output && output.addEventListener('click', event => {

    // клік на заголовку, щоб розгорнути (мобільні)
    if(isTouchDevice() && event.target.tagName === 'H1'){

        const items = output.querySelectorAll('.output-item');
        const current = event.target.parentNode;
        
        if(current.classList.contains('active')){

            current.classList.remove('active');
        } else if(!current.classList.contains('active')){
            
            for(let i = 0; i < items.length; i++){
                
                items[i].classList.remove('active');
            }

            current.classList.add('active');
        }
    }

    if(event.target.hasAttribute('data-href')){

        // get href aside element
        const href = event.target.dataset.href;

        // get title aside element
        const titles = event.target.dataset.titles;

        // if not home
        const paths = event.target.dataset.paths;

        // if id exists
        const id = event.target.dataset.id;

        // if network_device_id exists
        const network_device_id = event.target.dataset.network_device_id;

        // render breadcrumbs
        route(href,paths,titles);

        // render #output
        if(network_device_id !== undefined) {

            render(null, id, network_device_id);
        } else if(id !== undefined) {

            render(null, id);
            devices_parent = href;
        } 

        // update list
        breadcrumbsLi = breadcrumbs.querySelectorAll('li');
    }
});


/**
 * 
 * @breadcrumbs
 * click #breadcrumbs link
 * 
 */

breadcrumbs && breadcrumbs.addEventListener('click', event => {

    // елемент, на який клікнули
    const current = event.target.parentNode;

    // get href aside element
    const href = event.target.dataset.href;

    if(href === 'devices' || href === 'home'){
        
        // очистка змінної у хлібних крихтах
        devices_parent = null;
    }

    // щоб не вивалювало помилку, якщо ліст не сформований
    if(breadcrumbsLi !== undefined){

        // клонуємо хлібні крихти
        const clone = [...breadcrumbsLi];

        for(let i = 0; i < breadcrumbsLi.length; i++){
            
            // номер елемента, на який клікнули + 1
            const index = [...breadcrumbsLi].indexOf(current) + 1;

            // видаляємо усі елементи хлібних крихт
            breadcrumbsLi[i].remove();

            // рендеримо нові хлібні крихти
            for(let k = 0; k < index; k++){

                breadcrumbs.append(clone[k]);
            }
        }
    }

    render(href);

});


// catch all error
function checkError(err) {

    // clear token
    // localStorage.removeItem('access_token');

    // hide error
    // console.clear();

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

    // console.log(document.URL)

    // setTimeout(() => {
        
    //     // window.location.href = "./login-panel.html";
    //     window.location.href = window.location.href;
    // }, 2000);
}

// render breadcrumbs TODO: add 4 level
function route(href,paths,titles){

    if(href !== undefined){

        const links = paths.split(';');
        const names = titles.split(';');

        let content = '';

        // TODO: дата-атрибути зробити з повним шляхом
        for(let i = 0; i < links.length; i++){

            content += `<li><p data-href="${links[i]}"> ${names[i]} </p></li>`;
        }

        breadcrumbs.innerHTML = content;
    } else {
        
        breadcrumbs.innerHTML = '<li>Невідома сторінка</li>';
    }
    
}

// TODO: add 4 level
function render(href = null, id = null, network_device_id = null){

    // 4 level:
    // https://api.bill.lviv.ua/api/monitoring/devices/${network_device_id}/objects?children=${id}





    // 3 level
    if(network_device_id !== null){

        // console.log('id: ', id, '| network_device_id: ', network_device_id)

        // перелік з чілдренами 
        // fetch(`https://api.bill.lviv.ua/api/monitoring/devices/${network_device_id}/objects?children=1`, {

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

            // console.log('3: ', devices)

            // spinner
            loading(2000);
    
            let data = '';

            for(let i = 0; i < devices.data.length; i++){

                // temp
                const item = devices.data[i];

                // console.log('3: ', item)

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

                // {ethernet} -- видалено зі запиту!
                
                data += `
                    <div 
                        class="output-item"
                        data-paths="home;devices;level;${item.name}" 
                        data-titles="Початок;Обладнання;${devices_parent};${item.name}">
                            
                            <h1 class="${checkStatus(item.status)}">${item.name}</h1>
                            <p><span>${item.mac}</span></p>

                            <!-- <i class="${checkStatus(item.status)}"></i> ${item.name} -->

                            <hr>

                            <p>Причина дереєстрації: 
                                <span>${item.meta_data.deregreason !== undefined ? `${item.meta_data.deregreason}` : 'Немає даних'}</span></p>
                            <p>Останній час дереєстрації: 
                                <span>${item.meta_data.deregtime !== undefined ? `${item.meta_data.deregtime}` : 'Немає даних'}</span></p>

                            <hr>

                            ${rxpower}
                            
                    </div>`;

                level4 += `
                    <div 
                        class="output-item"
                        data-paths="home;devices;level;${item.name}" 
                        data-titles="Початок;Обладнання;${devices_parent};${item.name}">
                            
                            <h1 class="${checkStatus(item.status)}">${item.name}</h1>
                            <p><span>${item.mac}</span></p>

                            <!-- <i class="${checkStatus(item.status)}"></i> ${item.name} -->

                            <hr>

                            <p>Причина дереєстрації: 
                                <span>${item.meta_data.deregreason !== undefined ? `${item.meta_data.deregreason}` : 'Немає даних'}</span></p>
                            <p>Останній час дереєстрації: 
                                <span>${item.meta_data.deregtime !== undefined ? `${item.meta_data.deregtime}` : 'Немає даних'}</span></p>

                            <hr>

                            ${rxpower}
                            
                    </div>`;
            } 
            
            output.innerHTML = data;

            // add modificator
            output.className = 'grid-4';
        })
        .catch(error => checkError(error));

    // 2 level
    } else if(id !== null){

        // перелік без чілдренів (GPON0/1 GPON0/2 GPON0/3 ...)
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

            // spinner
            loading(2000);
    
            let data = '';

            for(let i = 0; i < devices.data.length; i++){

                // temp
                const item = devices.data[i];

                // console.log('2: ', item)              

                data += `
                    <div 
                        class="output-item"
                        data-href="${item.name}" 
                        data-paths="home;devices;level;${item.name}" 
                        data-titles="Початок;Обладнання;${devices_parent};${item.name}"  
                        data-network_device_id="${item.network_device_id}"
                        data-id="${item.id}">
                            <i class="${checkStatus(item.status)}"></i> ${item.name}
                    </div>`;
                
                level3 += `
                    <div 
                        class="output-item"
                        data-href="${item.name}" 
                        data-paths="home;devices;level;${item.name}" 
                        data-titles="Початок;Обладнання;${devices_parent};${item.name}"  
                        data-network_device_id="${item.network_device_id}"

                        data-id="${item.id}">
                            <i class="${checkStatus(item.status)}"></i> ${item.name}
                    </div>`;
            }
            
            output.innerHTML = data;

            // add modificator
            output.className = 'grid-4';
        })
        .catch(error => checkError(error));

    // level 1    
    } else if(href !== null){

        // spinner
        loading();

        switch(href){
    
            // Початок 
            case 'home': 
                output.innerHTML = '<h2>Початок</h2><p>Тут буде виводитися якась стартова інформація</p>';
    
                // add modificator
                output.className = 'one-block';
                break;
    
            // Обладнання
            case 'devices': 
                
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
    
                        // temp
                        const item = devices.data[i];

                        // console.log('1 :', item)
    
                        // status -- 0,1,2

                        data += `
                            <div 
                                class="output-item"
                                data-href="${item.name}" 
                                data-paths="home;devices;level" 
                                data-titles="Початок;Обладнання;${item.name}" 
                                data-id="${item.id}">
                                    <i class="${checkStatus(item.status)}"></i> ${item.name} <br> (id: ${item.id})
                                </div>`;
                    }
                    
                    // output.innerHTML = header + data + footer;
                    output.innerHTML = data;
    
                    // add modificator
                    output.className = 'grid-4';

                    // clear
                    level3 = '';

                    // TODO: clear level4?
                })
                .catch(error => checkError(error));
                break;
            
            // Налаштування
            case 'settings':
                output.innerHTML = '<h2>Налаштування</h2><p>Сторінка з налаштуваннями</p>';
    
                // add modificator
                output.className = 'one-block';
                break; 
    
            // Вихід
            case 'logout':
                window.location.href = "./login-panel.html";
                localStorage.removeItem('access_token');
                break;

            // test 3 level
            case 'level':
                output.innerHTML = level3;
                break;
    
            // id empty
            default: console.error('усі пункти повинні мати унікальну айдішку!');
    
        }
    } 

}

// check devices
function isTouchDevice() {

    // true if not desktop
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
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

// show spiner
function loading(time = 250){

    spinner.classList.add('active');

    setTimeout(() => {
        
        spinner.classList.remove('active');
    }, time);
}

// 16-10-2021