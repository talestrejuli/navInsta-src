const puppeteer = require('puppeteer');
const fs = require('fs').promises;

process.env.PUPPETEER_DOWNLOAD_PATH = './puppeteer_cache'; 

let LimiteMaxUsuario = 25; // Define a quantidade máxima de usuários que deseja seguir

async function getFirstUsernameFromFile() {
    try {
        const data = await fs.readFile('alvos.txt', 'utf-8');
        const usernames = data.split('\n');
        
        return usernames[0]; // Retorne o primeiro nome de usuário da lista
    } catch (error) {
        console.error('Erro ao ler o arquivo alvos.txt:', error.message);
        return null;
    }
}

async function addUserToNewFollowingFile(usernameToAdd) {
    try {
        await fs.appendFile('novos_seguindo.txt', `${usernameToAdd}\n`);
        console.log(`Usuário ${usernameToAdd} adicionado ao arquivo novos_seguindo.txt`);
    } catch (error) {
        console.error(`Erro ao adicionar o usuário ${usernameToAdd} ao arquivo novos_seguindo.txt:`, error.message);
    }
}

const funcaoPrincipalAssinc = async () => {
    const browser = await puppeteer.launch({ 
        //executablePath: '/usr/bin/google-chrome-stable',
        headless: false,
        //args: ['--no-sandbox', '--lang=pt-BR']
    });
    const page = await browser.newPage();
    
    // Acessa a página no Instagram e faz login
    // ... (o código de login permanece o mesmo)

    let contador = 1;

    // Localizar o arquivo alvos.txt e começar a seguir
    while (contador <= LimiteMaxUsuario) {
        const username = await getFirstUsernameFromFile();

        if (!username) {
            console.error('Não há mais nomes de usuário no arquivo alvos.txt. Encerrando...');
            break;
        }

        await page.goto(`https://www.instagram.com${username}`, { waitUntil: 'networkidle2' });
        console.log(`Navegou até a página do usuário ${username}`);

        // Aqui, você pode adicionar o código para começar a seguir o usuário
        // ...

        // Adicione o usuário ao arquivo novos_seguindo.txt
        await addUserToNewFollowingFile(username);
        
        contador++;
        console.log("Aguardando 10 segundos...");
        await page.waitForTimeout(10000);
    }

    console.log("Script concluído!");
    await browser.close();
}

funcaoPrincipalAssinc();

/*
module.exports = async function minhaFuncaoPrincipal() {
    await getFirstUsernameFromFile();
    await removeUserFromFile();
    await funcaoPrincipalAssinc();
};
*/