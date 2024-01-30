# bacia_infografica
(em construção)

[Preview](https://datazoompuc.github.io/bacia_infografica/)

### Parâmetros:
- organização da rede no arquivo [network.js](network.js), classes `Node` e `Network`;
- comportamento das linhas no arquivo [rivers.js](rivers.js). classe `River`;
- formatação dos textos em [style.css](style.css);
- parâmetros globais em [sketch.js](sketch.js);

### Instruções de uso: 
Para adicionar mais categorias e subcategorias editar o arquivo [categorias.csv](assets/categorias.csv). Cada coluna é considerada um nível hierárquico, os items da última coluna são considerados os pontos finais.

### Integração WordPress
Após publicar no [GitHub Pages](https://docs.github.com/es/pages/quickstart) ou qualquer outro host, inserir no WordPress um bloco html com o código abaixo:
```
<div class="alignfull has-no-padding shinyblock">
  <iframe class="shinyframe"  width="100%" height="600px" frameborder="0" scrolling="no" 
    src= "https://datazoompuc.github.io/bacia_infografica"  allowfullscreen="allowfullscreen">
  </iframe>
</div>
```

### Observações para manutenção:

* O arquivo [sketch.js](sketch.js) extrai as categorias do arquivo [assets/categorias.csv](assets/categorias.csv) que geram os nós do rio, e usa seus nomes para montar os links.
* O rio pode ser testado localmente a partir de uma branch, sem ser publicado, seguindo as instruções [daqui](https://stackoverflow.com/questions/38497334/how-to-run-html-file-on-localhost). Recomendo:
    1. Ter o Python instalado
    2. Abrir a branch que está usando no GitHub Desktop
    3. Digitar `cd endereco/da/pasta/bacia_infografica` no cmd
    4. Rodar `python -m http.server` no cmd
    5. Abrir o endereço [localhost:8000](localhost:8000) em um navegador (para mim não funcionou no Chrome)  
