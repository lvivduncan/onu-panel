// 24-09-2021

const body = document.getElementsByTagName('body')[0];

const breadcrumbs = document.getElementById('breadcrumbs');

// output data
const output = document.getElementById('output');

// view/hide password input
const passwordView = document.querySelector('#label-password .view');
const passwordInput = document.querySelector('#label-password input');

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

/*     // if click to section -- remove (open)
    adminSection.addEventListener('click', () => {

        adminPanel.classList.remove('toggle');

        for(let i = 0; i < spans.length; i++){

            spans[i].classList.remove('toggle');
        }
    }); */
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
    });
}

/**
 * 
 * @main
 * click #output element
 * 
 */

output && output.addEventListener('click', event => {

    // TODO: зробити перевірку за іншим атрибутом!
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
        // else {

        //     render(href);
        //     // alert(href)
        // }
    }
});


/**
 * 
 * @breadcrumbs
 * click #breadcrumbs link
 * 
 */

breadcrumbs && breadcrumbs.addEventListener('click', event => {

    // get href aside element
    const href = event.target.dataset.href;

    if(href === 'devices' || href === 'home'){
        
        // очистка змінної у хлібних крихтах
        devices_parent = null;
    }
    
    // render #output
    render(href);

    console.log(devices_parent)

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

// render breadcrumbs
function route(href,paths,titles){

    if(href !== undefined){

        const links = paths.split(';');
        const names = titles.split(';');

        let content = '';

        // TODO: дата-атрибути зробити з повним шляхом
        for(let i = 0; i < links.length; i++){

            // data-href для визначення лінку. більше ніц тут не тре
            content += `<li><p data-href="${links[i]}"> ${names[i]} </p></li>`;
        }

        breadcrumbs.innerHTML = content;
    } else {
        
        breadcrumbs.innerHTML = '<span>Невідома сторінка</span>';
    }
    
}


function render(href = null, id = null, network_device_id = null){

    // href -- data-href (лінк на сторінку)
    // id -- data-id device (айдішка девайса)
    // network_device_id -- data-network_device_id (айдішка парента для ону)

    if(network_device_id !== null){

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

                // temp
                const item = devices.data[i];

                // console.log(item)    

                // data-titles data-paths неправильний шлях (не повний)
                data += `
                    <div 
                        class="output-item"
                        data-href="${item.name}" 
                        data-paths="home;devices;${item.name}" 
                        data-titles="Початок;Обладнання;${item.parent_id};${item.parent_id};${item.name}" 
                        
                        data-id="${item.id}">

                            <h1>${item.name}</h1>
                            <p>mac: <span>${item.mac}</span></p>
                            <p>updated: <span>${item.updated_at.replace('.000000Z','')}</span></p>
                            <p>(debug, parent_id): ${item.parent_id}</p>

                    </div>`;
            }
            
            output.innerHTML = data;

            // add modificator
            output.className = 'grid';
        })
        .catch(error => checkError(error));

    } else if(id !== null){

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
    
            let data = '';

            for(let i = 0; i < devices.data.length; i++){

                // temp
                const item = devices.data[i];

                console.log(devices_parent, item)

                // неправильний шлях (не повний)
                data += `
                    <div 
                        class="output-item"
                        data-href="${item.name}" 
                        data-paths="home;devices;${item.name}" 
                        data-titles="Початок;Обладнання;${item.name}"  
                        data-network_device_id="${item.network_device_id}"
                        data-id="${item.id}">
                            ${item.name}
                    </div>`;
            }
            
            output.innerHTML = data;

            // add modificator
            output.className = 'grid';
        })
        .catch(error => checkError(error));
    } else if(href !== null){

        switch(href){
    
            // Початок 
            case 'home': 
                output.innerHTML = '<h1>Початок</h1><p>Тут буде виводитися якась стартова інформація</p>';
    
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
    
                        // console.log(item)

                        // 3 тестових девайса  
    
                        data += `
                            <div 
                                class="output-item"
                                data-href="${item.name}" 
                                data-paths="home;devices;${item.name}" 
                                data-titles="Початок;Обладнання;${item.name}" 
                                data-id="${item.id}">
                                    ${item.name} <br> (id: ${item.id})
                                </div>`;

                        // devices_parent = `${item.name}`;
                        // console.log(devices_parent)
                    }
                    
                    // output.innerHTML = header + data + footer;
                    output.innerHTML = data;
    
                    // add modificator
                    output.className = 'grid';
                })
                .catch(error => checkError(error));
                break;
            
            // Налаштування
            case 'settings':
                output.innerHTML = '<h1>Налаштування</h1>';
    
                // add modificator
                output.className = 'one-block';
                break; 
    
            // Вихід
            case 'logout':
                window.location.href = "./login-panel.html";
                localStorage.removeItem('access_token');
                break;

            // Заглушка
            case 'empty':
                console.log('Заглушка. Пустий пункт меню');
                break;
    
            // id empty
            default: console.error('усі пункти повинні мати унікальну айдішку!');
    
        }
    } 

}


// TODO: перемінна з батьківський лінком, коли перехід до онушки
