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
