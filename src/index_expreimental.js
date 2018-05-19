const R = require('ramda')
const { arrToObj, call, callob, chain, natSort, objsArrayToObjMap } = require('./uchill')

const readTsvAsArrayOfArrays = x => {
    console.log(x)
    return [
        ['Concatenated', 'Monster', 'Element', 'Nat Stars', 'Type', '3* Code', '3* % Proc', '3* # Turns', '3* Requires Crit', '5* Code', '5* % Proc', '5* # Turns', '5* Requires Crit', '5* Active Heal?', '5* Single-Target?', 'Stat Weighting'],
        ['Dark Banshee', 'Banshee', 'Dark', '4', 'Tank', '42 - Sap (2 types)', '100%', '1', 'No', '23 - Sleep', '100%', '1', 'No', 'No', 'No', '4'],
        ['Light Mini Seira', 'Mini Seira', 'Light', '4', 'Attacker', '91 - Battle Rush (Recover 20% HP and SP)', '100%', '1', 'No', '116 - Elemental Edge', '100%', '1', 'No', 'No', 'No', '3'],
        ['Water Minicat', 'Minicat', 'Water', '3', 'Recovery', '72 - Morale Boost (Own SP by 20%)', '100%', '1', 'No', '133 - Shield (Based on Recovery)', '100%', '2', 'No', 'Yes', 'No', '5'],
        ['Wood D\'Artagnan', 'D\'Artagnan', 'Wood', '4', 'Balanced', '15 - Recovery Down (HP)', '80%', '2', 'No', '21 - Stun', '100%', '1', 'No', 'No', 'Yes', '4']
    ]
}

const convertMonstersArraysToMonstersObjects = ([paramsArray, ...arrayOfMonsterArrays]) =>
    arrayOfMonsterArrays.map(monsterArray => arrToObj(monsterArray, paramsArray))

const copy = src => src
    
const sortMonstersByRankDescending = d => {}
const createOutputHtmlFromData = d => {}

const printData = x => y => console.log(`\n***\n${x}\n***\n${JSON.stringify(y)}\n***\n`)

const writeOutputInto = R.curry((f, d) => console.log(f, d))

const extractAttribute = attribute => monsterObjects => monsterObjects.map(monster => monster[attribute])

const uniqUnionFrom = (attr1, attr2) => data => R.union(data[attr1], data[attr2])

const sort = attr => data => data[attr] = natSort(data[attr])

const remove = attr => data => delete data[attr]

const convertMonsterObjectsArrayToMonstersMap = data => objsArrayToObjMap(data)

// chain()
//     .then(call(readTsvAsArrayOfArrays)
//         .with('./data/skill.tsv')
//         .setting('monsterArrays')
//     )
//     .then(call(convertMonstersArraysToMonstersObjects)
//         .using('monsterArrays')
//         .setting('monsterObjects')
//     )
//     .then(call(remove('monsterArrays')))
//     .then(call(extractAttribute('Monster'))
//         .using('monsterObjects')
//         .setting('monsterNames')
//     )
//     .then(call(sort('monsterNames')))
//     .then(call(extractAttribute('3* Code'))
//         .using('monsterObjects')
//         .setting('skills3')
//     )
//     .then(call(extractAttribute('5* Code'))
//         .using('monsterObjects')
//         .setting('skills5')
//     )
//     .then(call(uniqUnionFrom('skills3', 'skills5'))
//         .setting('skills')
//     )
//     .then(call(remove('skills3')))
//     .then(call(remove('skills5')))
//     .then(call(sort('skills')))
//     .then(call(convertMonsterObjectsArrayToMonstersMap)
//         .using('monsterObjects')
//         .setting('monsters')
//     )
//     .then(call(remove('monsterObjects')))
//     .then(call(printData('mo')).using('monsters'))
//     .then(call(printData('mn')).using('monsterNames'))
//     .then(call(printData('sk')).using('skills'))
//     // .then(call(createOutputHtmlFromData))
//     // .then(call(writeOutputInto('./out/out.html')))


chain()
    .then(call(readTsvAsArrayOfArrays).with('./data/skill.tsv').setting('monsterArrays'))
    .then(call(convertMonstersArraysToMonstersObjects).using('monsterArrays').setting('monsterObjects'))
    .then(call(remove('monsterArrays')))
    .then(call(extractAttribute('Monster')).using('monsterObjects').setting('monsterNames'))
    .then(call(sort('monsterNames')))
    .then(call(extractAttribute('3* Code')).using('monsterObjects').setting('skills3'))
    .then(call(extractAttribute('5* Code')).using('monsterObjects').setting('skills5'))
    .then(call(uniqUnionFrom('skills3', 'skills5')).setting('skills'))
    .then(call(remove('skills3')))
    .then(call(remove('skills5')))
    .then(call(sort('skills')))
    .then(call(convertMonsterObjectsArrayToMonstersMap).using('monsterObjects').setting('monsters'))
    .then(call(remove('monsterObjects')))
    .then(call(printData('mo')).using('monsters'))
    .then(call(printData('mn')).using('monsterNames'))
    .then(call(printData('sk')).using('skills'))
    // .then(call(createOutputHtmlFromData))
    // .then(call(writeOutputInto('./out/out.html')))