// 19-10-2021
// tmp -- щоб коду не було забагато, потім об'єднати

// TODO: неправильний пароль -- релод

const body = document.getElementsByTagName('body')[0];

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

}
