/*
 * clear a sentence from the comments and annotations
 */

utterance
  = s:ub* { return s; }
  / markinit s:ub* { return s; }
  / s:ub* ep:endponctu { return s + ' ' + ep; }
  / markinit s:ub* ep:endponctu { return s + ' ' + ep; }

ub
 = s:u blank { return s; }
 / s:u { return s; }

u
  = c:crochet { return c; }
  / c:chevron { return c; }
  / p:ponctu { return p; }
  / "aujourd'hui" { return "aujourd'hui"; }
  / "entr'ouvrir" { return "entr'ouvrir"; }
  / "d'abord" { return "d'abord"; }
  / m:motnombre { return m; }
  / m:motmaj { return m; }
  / m:mot { return m; }
  / n:nombre { return n; }
  / b:blank
  / o:others { return o; }
  / g:groupin { return g; }
  / g:groupout { return g; }

markinit
  = "+<"
  / "+,"
  / "+^"
  / "+<"

crochet
  = ci:"[" c:toutsymb* cf:"]" { return [ci + c.join('') + cf]; }
  / ci:"⟦" c:toutsymb* cf:"⟧" { return [ci + c.join('') + cf]; }
  / ci:"⁅" c:toutsymb* cf:"⁆" { return [ci + c.join('') + cf]; }
  / ci:"⌜" c:toutsymb* cf:"⌟" { return [ci + c.join('') + cf]; }

chevron
  = ci:"<pause" c:toutsymbsanschevron* cf:">" { return [ci + c.join('') + cf]; }
  / ci:"<incident" c:toutsymbsanschevron* cf:">" { return [ci + c.join('') + cf]; }
  / ci:"<seg>" { return [ci]; }
  / ci:"</seg>" { return [ci]; }

groupout
  = go:">" { return ['⌉']; }
  / go:"⟫" { return ['⌉']; }

groupin
  = gi:"<" { return ['⌈']; }
  / gi:"⟪" { return ['⌈']; }

mot
  = initial:lettre milieu:lettremilieumajapos+ fin:lettre { return [initial + reste.join('')] + fin; }
  / initial:lettreapi mot:lettremilieuapi*  w:" "? apos:['] { return [initial + mot.join('') + "'"]; }
  / mot:lettreapi+ { return [mot.join('')]; }

motmaj
  = initial:lettremaj milieu:lettremilieumajapos+ fin:lettreminmaj { return [initial + reste.join('')] + fin; }
  / initial:lettremaj apos:['] { return [initial + apos]; }
  / initial:lettremaj reste:lettreapi+ apos:['] { return [initial + reste.join('') + apos]; }
  / initial:lettremaj reste:lettremilieumajapos* { return [initial + reste.join('')]; }

motnombre
  = initial:lettreminmaj reste:[-+0-9]+ { return [initial + reste.join('')]; }

nombre
  = digits:[0-9-+()*]+ { return [digits.join('')]; }

endponctu
  = "#+" p:[.?!/;:,]+ { return ["#" + p.join('')]; }
  / "#" p:[.?!/;:,]+ { return ["#" + p.join('')]; }
  / "+" p:[.?!/;:,]+ { return ["#" + p.join('')]; }
  / pct:[.!?,;:]+ { return ['#' + pct.join('')]; }

ponctu
  = pct:[.!?]+ { return ['#'+pct]; }
  / pct:[,;:]+ { return ['#'+pct]; }

blank
  = [ \t\r\n]+

others
  = oth:[#$&°§=*] { return ['_'+oth+'_']; }

lettre
  = [a-zàâäéèêëçïîôöùüû_(){}/\\@]

lettremaj
  = [A-ZÀÂÄÉÈËÊÇÏÎÖÔÚÜÛ_(){}/\\@]

api
  = [iyɨʉɯuɪʏʊeøəɘɵɤoɛœɜɞʌɔæɐaɶɑɒɚɝ]
  / [ẽø̃ɛ̃õɔ̃ãɑ̃]
  / [pbdtʈɖcɟkɡqɢʔmɱɳɲŋɴʙrɽʀⱱɾɸβfvθðszʃʒʂʐçʝxɣχʁħʕhɬɮʋɹɻjɰlɭʎʟ]

lettreapi
  = lettre
  / api

lettremilieuapi
  = lettre
  / api
  / [-+]

lettreminmaj
  = lettre
  / lettremaj
  / api

lettremilieumajapos
  = lettre
  / lettremaj
  / api
  / [-+']

toutsymb
  = toutsymbsanschevron
  / [<>]

toutsymbsanschevron
  = lettre
  / lettremaj
  / [0-9#$&°§=*(){}/\\@.!?:;'," \t\r\n]
 