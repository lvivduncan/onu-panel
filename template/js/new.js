
{
    const aside = document.querySelector('#aside');
    const asideButton = aside.querySelector('#aside-button');

    const header = document.querySelector('#header');
    const headerButton = header.querySelector('#header-button');

    const main = document.querySelector('#main');

    asideButton && asideButton.addEventListener('click', () => {

        aside.classList.toggle('active');
        header.classList.remove('active');
    });

    headerButton && headerButton.addEventListener('click', () => {

        header.classList.toggle('active');
        aside.classList.remove('active');
    });

    main && main.addEventListener('click', () => {

        header.classList.remove('active');
        aside.classList.remove('active');
    });
}