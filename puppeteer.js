const puppeteer = require('puppeteer');
const fs = require('fs').promises;

process.env.PUPPETEER_DOWNLOAD_PATH = './puppeteer_cache'; 

let LimiteMaxUsuario = 25; //Define a quantidade maxima de usuários que deseja parar de seguir

async function getFirstUsernameFromFile() {
    try {
        const data = await fs.readFile('volta.txt', 'utf-8');
        const usernames = data.split('\n');
        
        return usernames[0]; // Retorne o primeiro nome de usuário da lista
    } catch (error) {
        console.error('Erro ao ler o arquivo volta.txt:', error.message);
        return null;
    }
}

async function removeUserFromFile(usernameToRemove) {
    try {
        const data = await fs.readFile('volta.txt', 'utf-8');
        const usernames = data.split('\n');
        
        // Filtra o nome de usuário que você quer remover
        const updatedUsernames = usernames.filter(username => username.trim() !== usernameToRemove.trim());

        // Reescreva o arquivo com a lista atualizada
        await fs.writeFile('volta.txt', updatedUsernames.join('\n'));

        console.log(`Usuário ${usernameToRemove} removido do arquivo volta.txt`);
    } catch (error) {
        console.error(`Erro ao remover o usuário ${usernameToRemove} do arquivo volta.txt:`, error.message);
    }
}

const funcaoPrincipalAssinc = async () => {
(async () => {
    const browser = await puppeteer.launch({ 
        executablePath: '/usr/bin/google-chrome-stable', //Comentar esta linha caso esteja rodando local
        headless: "new", //headless FALSE para ver o browser
        args: ['--no-sandbox'] 
    });
    const page = await browser.newPage();
    
    //Acessa a página no instagram
    await page.goto('https://www.instagram.com');

    // Aqui, inserimos o código para logar, navegar e realizar as ações necessárias.
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'tales.jessyca');
    await page.type('input[name="password"]', 't@lesejessyca123..');
    await page.click('button[type="submit"]');

    //Esperar o login ser realizado
    await page.waitForTimeout(6000);

    //Clica no primeiro botão "Agora não"
    try {
        const button = await page.$x("//div[contains(., 'Agora não') and @role='button']");
        
        if (button.length > 0) {
            await button[0].click();
            console.log('Clicou no botão "Agora não"');
        } else {
            console.log('Botão "Agora não" não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao buscar ou clicar no botão:', error.message);
    }

    await page.waitForTimeout(2000);

    //Clica no segundo botão "Agora não"
    try {
        let button = await page.$x("//button[contains(., 'Agora não') and @tabindex='0']");
        
        if (button.length > 0) {
            await button[0].click();
            console.log('Clicou no botão "Agora não"');
        } else {
            console.log('Botão "Agora não" não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao buscar ou clicar no botão:', error.message);
    }
    
    let contador = 1;

    //Localizar o arquivo volta.txt e deixar de seguir
    while (contador <= LimiteMaxUsuario) {
        const username = await getFirstUsernameFromFile();

        if (!username) {
            console.error('Não há mais nomes de usuário no arquivo volta.txt. Encerrando...');
            break;
        }

        await page.goto(`https://www.instagram.com${username}`, { waitUntil: 'networkidle2' });
        console.log(`Navegou até a página do usuário ${username}`);

        //Esperar abrir a página do usuário
        await page.waitForTimeout(2000);

    
            //Localizar o botão seguindo e clica
           
                // Encontrar a div que contém o texto "Seguindo"
                const buttonSeguindo = await page.$x("//div[contains(text(), 'Seguindo')]");
                
                if (buttonSeguindo.length > 0) {
                    // Clicar na primeira div que contém o texto "Exemplo"
                    await buttonSeguindo[0].click();
                    console.log('Botão Seguindo encontrado e clicado.');
                  } else {
                    console.log('Botão Seguindo não encontrado.');
                  }

            //Esperar abrir a página do usuário
            await page.waitForTimeout(2000);
            
                // Encontrar a div que contém o texto "Deixar de Seguir"
                const buttonDeixarSeguir = await page.$x("//span[contains(text(), 'Deixar de seguir')]");
                
                if (buttonDeixarSeguir.length > 0) {
                    // Clicar na primeira div que contém o texto "Exemplo"
                    await buttonDeixarSeguir[0].click();
                    console.log('Botão Deixar de Seguir encontrado e clicado.');
                  } else {
                    console.log('Botão Deixar de seguir não encontrado.');
                  }

            // Remova o usuário do arquivo
            await removeUserFromFile(username);
        
        contador++;
        console.log("äguardando 10 segundos...");
        await page.waitForTimeout(10000);
    }

    console.log ("Script concluído!");
    await browser.close();

})();
}

funcaoPrincipalAssinc();

/*
module.exports = async function minhaFuncaoPrincipal() {
    await getFirstUsernameFromFile();
    await removeUserFromFile();
    await funcaoPrincipalAssinc();
};
*/