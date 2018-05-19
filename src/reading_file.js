const fs = require('fs')
const fsP = require('fs/promises')
const readline = require('readline')

const rows = []
let fileSize = 0
let readSize = 0
fsP.stat('./data/skill.tsv').then(({ size }) => fileSize = size)

const log = msg => process.stdout.write(`${msg}\x1b[0G`)

readline
  .createInterface({
    input: fs.createReadStream('./data/skill.tsv')
  })
  .on('line', line => {
    readSize += line.length + 1
    log(`${readSize}, ${fileSize}`)
    rows.push(line.split('\t'))
  })
  .on('close', e => console.log('\n'))


