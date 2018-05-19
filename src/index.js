const fs = require('fs')
const readline = require('readline')
const R = require('ramda')
const { arrToObj, call, callob, chain, natSort, objsArrayToObjMap } = require('./uchill')

const readFile = (file, rows = []) => new Promise(resolve =>
    readline
    .createInterface({
        input: fs.createReadStream(file)
    })
    .on('line', line =>
        rows.push(line.split('\t'))
    )
    .on('close', () => resolve(rows))
)

const convertMonstersArraysToMonstersObjects = ([paramsArray, ...arrayOfMonsterArrays]) =>
    arrayOfMonsterArrays.map(monsterArray => arrToObj(monsterArray, paramsArray))

const skillMap = {}

const elementToLetter = {
    'Fire': 'R',
    'Water': 'B',
    'Wood': 'G',
    'Light': 'L',
    'Dark': 'D'
}

const skillTags = {
    act: '', ALLY: 'allies', Atk: '', Block: '', Def: '', FOE: 'foe', Heal: '', HP: '',
    Less: '-', CS: '<CS>', Mod: '', pas: '', Plus: '+', Rec: '', SELF: 'own', Shield: '', SP: ''
}
Object.keys(skillTags).forEach(k => skillTags[k] = skillTags[k] || k)

const skillsIconMap = (({
    act, ALLY, Atk, Block, Def, FOE, Heal, HP, Less, CS,
    Mod, pas, Plus, Rec, SELF, Shield, SP
}) => ({
    'Defense Down': [act,FOE,Def,Less],
    'Expose Weakness': [act,FOE,Def,Less],
    'Attack Down': [act,FOE,Atk,Less],
    'Defense Up': [act,ALLY,Def,Plus],
    'Attack Up': [act,ALLY,Atk,Plus],
    'Recovery Down (H': [act,FOE,Heal,Less],
    'Recovery Down (S': [act,FOE,Rec,Less],
    'Recovery Up (H': [act,ALLY,Rec,Plus],
    'Stun': [act,FOE,Block,Less],
    'Silence': [act,FOE,Block,Less],
    'Sleep': [act,FOE,Block,Less],
    'Petrify': [act,FOE,Block,Less],
    'Shock': [act,FOE,Block,Less],
    'Seal': [act,FOE,Block,Less],
    'Blind': [act,FOE,Block,Less],
    'Taunt': [act,FOE,Block,Less],
    'Adrenaline (Ally HP': [pas,ALLY,HP,Plus],
    'Adrenaline (Own HP': [pas,SELF,HP,Plus],
    'SP Siphon': [pas,ALLY,SP,Plus],
    'Restore Allies HP in Proportion to Damage Dealt': [pas,ALLY,HP,Plus],
    'HP Siphon': [pas,SELF,HP,Plus],
    'Attacking Specific Element': [pas,SELF,Atk,Plus],
    'Battle Rush': [pas,SELF,HP,Plus,SP],
    'Morale Boost (Own': [pas,SELF,SP,Plus],
    'Morale Boost (Ally': [pas,ALLY,SP,Plus],
    'Vigor': [act,ALLY,Heal,Plus],
    'Zeal': [act,ALLY,Rec,Plus],
    'Resilience': [pas,ALLY,Rec,Plus],
    'Shield (': [act,ALLY,Shield,Plus],
    'Hunter': [pas,SELF,Atk,Plus],
    'Predator': [pas,SELF,Atk,Plus],
    'Sap': [act,FOE,HP,Less],
    'Aggression': [pas,SELF,Mod,Plus],
    'Crit Rate +': [pas,SELF,Atk,Plus],
    'Thirst': [act,FOE,SP,Less],
    'Dominance Buff': [act,ALLY,SP,Less],
    'Fatigue': [act,FOE,Rec,Less],
    'Leverage': [pas,SELF,CS,Atk],
    'Elemental Edge': [pas,SELF,Mod,Plus],
    'Vengeance': [pas,SELF,Mod,Plus],
    'Merciless Strike': [pas,SELF,Mod,Plus],
    'Boon: Red': [pas,FOE,HP,Plus],
    'Boon: Blue': [pas,FOE,SP,Plus],
    'Breaker': [pas,FOE,Mod,Less],
    'Purification': [pas,FOE,Mod,Less]
}))(skillTags)

const stringOf = ({id, turns, proc, tags, eff}) => `[${id}]: ${proc} [${turns}T] ${tags.join(' ')} ${eff}`

const run = async () => {
    let x = await readFile('./data/skill.tsv')
    x = convertMonstersArraysToMonstersObjects(x)

    const monstersByName = {}
    for (const m of x) {
        const { Monster: monsterName } = m
        monstersByName[monsterName] = monstersByName[monsterName] || {}
        monstersByName[monsterName][elementToLetter[m.Element]] = m
        let value = m['3* Code']
        let code = parseInt(value)
        skillMap[code] = skillMap[code] || value
        value = m['5* Code']
        code = parseInt(value)
        skillMap[code] = skillMap[code] || value
    }

    for (const [i, skill] of Object.entries(skillMap)) {
        for (const [ key, icon ] of Object.entries(skillsIconMap)) {
            if (skill.indexOf(key) > -1) {
                skillMap[i] = { id: ~~i, name: skillMap[i].substring(i.length + 3), tags: icon }
                break
            }
        }
    }

    for (const [i, skill] of Object.entries(skillMap)) {
        skillMap[i].eff = `100%`
        for (let pct = 100; pct > 0; pct = pct - 5) {
            if (skill.name.indexOf(`${pct}%`) > -1) {
                skillMap[i].eff = `${pct}%`
                break
            }
        }
    }

    for (const skill of Object.values(skillMap)) {
        console.log(JSON.stringify(skill))
    }

    const monstersByStars = { 2: {}, 3: {}, 4: {}, 5: {} }
    for (const m in monstersByName) {
        const monsterGroup = monstersByName[m]
        const elements = Object.keys(monsterGroup).reduce((acc, elem) => {
            const mon = monsterGroup[elem]
            const s3 = skillMap[parseInt(mon['3* Code'])]
            const s5 = skillMap[parseInt(mon['5* Code'])]
            return {
                ...acc,
                [elem]: {
                    ns: ~~mon['Nat Stars'],
                    s3: {
                        id: s3.id,
                        turns: mon['3* # Turns'],
                        proc: mon['3* % Proc'],
                        tags: [
                            'attack',
                            ...s3.tags
                        ],
                        eff: s3.eff,
                    },
                    s5: {
                        id: s5.id,
                        turns: mon['5* # Turns'],
                        proc: mon['5* % Proc'],
                        tags: [
                            mon['5* Active Heal?'] === 'Yes'
                                ? 'cure'
                                : mon['5* Single-Target?'] === 'No'
                                    ? 'multi'
                                    : 'attack',
                            ...s5.tags
                        ],          
                        eff: s5.eff,          
                    }
                }
            }
        }, {})
        const maxStars = Object.values(monsterGroup).reduce((r, { 'Nat Stars': c }) =>
            r = r > c ? r : c, 0)
        monstersByStars[maxStars][ m ] = elements
    }

    for (const [ stars, mons ] of Object.entries(monstersByStars)) {
        for (const [ mon, elems ] of Object.entries(mons)) {
            console.log()
            for (const [ elem, info ] of Object.entries(elems)) {
                console.log(`${mon} (${elem}): Nat ${info.ns} stars`)
                console.log(`${stringOf(info.s3)}`)
                console.log(`${stringOf(info.s5)}`)
            }
        }
    }
}

run()