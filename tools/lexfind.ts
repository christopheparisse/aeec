import * as lexmain from './lexmain';

// node test.js /colaje/Enfants/antoine/antoine-37-2_04_25.teiml 
// node test.js /colaje/Enfants/antoine/antoine-11-0_11_09_chat.teiml

let ps = lexmain.parseargs(process.argv.slice(2));
lexmain.process(ps.commmand, ps.files, ps.tiers, ps.search, ps.width, ps.param, ps.output);
