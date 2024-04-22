const puppeteer = require('puppeteer');
const fs = require('fs'); //Módulo para escrita no arquivo
const fsp = require('fs').promises;

(async () => {
    // Configuração inicial
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const username = 'tales.jessyca';
    const senha = 'jessyc@.t@les123...';
    const maxUserCount = 0;
    const scrollDelay = 2000; // Atraso de rolagem em milissegundos

    // Tentar ler os cookies de um arquivo cookies.json
    let cookies;
    try {
        cookies = JSON.parse(await fsp.readFile('cookies.json', 'utf8'));
    } catch (err) {
        console.log('Nenhum arquivo de cookies encontrado. Redirecionando para fazer login...');
    }
    
    if (cookies && cookies.length) {
        // Se os cookies existirem, configure-os na página
        await page.setCookie(...cookies);
        console.log('Cookies carregados');
      } else {

        // Acessa o Instagram e faz o login
        await page.goto('https://www.instagram.com');
        await page.waitForSelector('input[name="username"]');
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', senha);
        await page.click('button[type="submit"]');

        //Aguardando 1 minuto
        await page.waitForTimeout(60000);

      }

    //Salvando cookies do login
    cookies = await page.cookies();
    await fsp.writeFile('cookies.json', JSON.stringify(cookies));


    // Clica no botão "Agora não" se aparecer (primeira vez)
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

    // Clica no botão "Agora não" se aparecer (segunda vez)
    try {
        const button = await page.$x("//button[contains(., 'Agora não') and @tabindex='0']");
        if (button.length > 0) {
            await button[0].click();
            console.log('Clicou no botão "Agora não"');
        } else {
            console.log('Botão "Agora não" não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao buscar ou clicar no botão:', error.message);
    }
      
    // Navega para a página de seguindo
    await page.goto(`https://www.instagram.com/${username}/following`);
    await page.waitForTimeout(8000);

    let uniqueHrefs = new Set();
    let prevScrollHeight = 0;

    // Loop para coletar hrefs de seguindo
    while (maxUserCount === 0 || uniqueHrefs.size < maxUserCount) {
    // Rola a lista de seguindo para baixo e obtém a nova altura de rolagem
    let newScrollHeight = await page.evaluate(() => {
        const dialog = document.querySelector('._aano');
        if (dialog) {
        dialog.scrollTop = dialog.scrollHeight;
        return dialog.scrollHeight;
        }
        return null;
    });

    if (prevScrollHeight === newScrollHeight) {
        let retries = 3;
        let success = false;
      
        while (retries-- > 0) {
          await page.waitForTimeout(scrollDelay);
          newScrollHeight = await page.evaluate(() => {
            const dialog = document.querySelector('._aano');
            if (dialog) {
              return dialog.scrollHeight;
            }
            return null;
          });
      
          if (prevScrollHeight !== newScrollHeight) {
            success = true;
            break;
          }
        }
      
        if (!success) {
          break; // realmente chegou ao final
        }
      }

    // Atualiza a altura de rolagem anterior para a próxima iteração
    prevScrollHeight = newScrollHeight;

    // Aguarda para que mais itens sejam carregados
    await page.waitForTimeout(scrollDelay);

    // Obtém todos os hrefs atualmente visíveis na lista de seguindo
    const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('._aano a'), a => a.getAttribute('href'));
    });

    // Adiciona novos seguindo ao conjunto de seguindo únicos
    for (const newHref of hrefs) {
        if (!uniqueHrefs.has(newHref)) {
            uniqueHrefs.add(newHref);
    
            // Escreve o novo href no console
            console.log(`Novo href capturado: ${newHref}`);
    
            // Escreve o novo href no arquivo seguindo.txt
            fs.appendFileSync('seguindo.txt', `${newHref}\n`);
    
            // Se atingir o limite máximo de seguindo, interrompe o loop
            if (maxUserCount !== 0 && uniqueHrefs.size >= maxUserCount) {
                console.log(`Limite de ${maxUserCount} usuários alcançado.`);
                break;
            }
        }
    }
    }

    console.log("Fim da busca!");
    //await browser.close();

})();
