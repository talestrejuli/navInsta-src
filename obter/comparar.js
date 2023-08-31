const fs = require('fs');

// Ler o arquivo seguindo.txt e armazenar suas linhas em um array
fs.readFile('seguindo.txt', 'utf-8', (err, seguindoData) => {
  if (err) {
    console.error('Erro ao ler o arquivo seguindo.txt:', err);
    return;
  }
  
  const seguindoArray = seguindoData.trim().split('\n');

  // Ler o arquivo seguidores.txt e armazenar suas linhas em um array
  fs.readFile('seguidores.txt', 'utf-8', (err, seguidoresData) => {
    if (err) {
      console.error('Erro ao ler o arquivo seguidores.txt:', err);
      return;
    }
    
    const seguidoresArray = seguidoresData.trim().split('\n');
    
    // Encontrar as diferenças entre os arrays
    const diferencaArray = seguindoArray.filter(x => !seguidoresArray.includes(x));
    
    // Escrever as diferenças em um novo arquivo chamado volta.txt
    fs.writeFile('volta.txt', diferencaArray.join('\n'), (err) => {
      if (err) {
        console.error('Erro ao escrever o arquivo volta.txt:', err);
      } else {
        console.log('Arquivo volta.txt foi criado com sucesso!');
      }
    });
  });
});
