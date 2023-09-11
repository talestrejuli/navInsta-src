const puppeteer = require('puppeteer');
const fs = require('fs');

// Configurações
const maxUserCount = 3000; // Quantidade máxima de usuários a serem capturados
const scrollDelay = 2000; // Delay entre as rolagens (em milissegundos)

// Função para rolar a página e capturar seguidores
async function getFollowersFromPage(page, targetUsername) {
    const followers = [];

    console.log(`Acessando a página de seguidores do usuário ${targetUsername}...`);
    await page.goto(`https://www.instagram.com/${targetUsername}/followers/`, { waitUntil: 'networkidle2' });

    let prevScrollHeight = 0;

    while (followers.length < maxUserCount) {
        let newScrollHeight = await page.evaluate(() => {
            const dialog = document.querySelector('._aano');
            if (dialog) {
                dialog.scrollTop = dialog.scrollHeight;
                return dialog.scrollHeight;
            }
            return null;
        });

        if (prevScrollHeight === newScrollHeight) {
            break; // Chegou ao final da lista
        }

        prevScrollHeight = newScrollHeight;
        await page.waitForTimeout(scrollDelay);

        const currentFollowers = await page.$$eval('._aano a', nodes => nodes.map(n => n.innerText));

        // Escreve os novos seguidores no arquivo alvos.txt
        const newFollowers = [];
        for (const follower of currentFollowers) {
            if (!followers.includes(follower)) {
                followers.push(follower);
                newFollowers.push(follower);
                fs.appendFileSync('alvos.txt', `${follower}\n`);
            }
        }

        if (newFollowers.length > 0) {
            console.log(`Obteve os usuários ${newFollowers.join(', ')} e adicionou no arquivo.`);
        }
    }

    return followers;
}

// Função principal
async function main() {
    // Verifica se o arquivo alvos.txt já existe
    if (fs.existsSync('alvos.txt')) {
        console.log("Arquivo alvos.txt já existe, encerrando.");
        return;
    }

    console.log("Iniciando o navegador...");
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();

    // Fazer login
    console.log("Acessando o Instagram...");
    await page.goto('https://www.instagram.com');
    console.log("Preenchendo os campos de login...");
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'tales.jessyca');
    await page.type('input[name="password"]', 't@lesejessyca123..');
    console.log("Clicando no botão de login...");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(6000);

    // Capturar seguidores
    const targetUsername = 'escolaespiritadobrasil'; // Substitua pelo nome do usuário alvo
    await getFollowersFromPage(page, targetUsername);

    console.log("Encerrando o navegador...");
    await browser.close();
}

main().catch(console.error);
