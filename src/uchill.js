const R = require('ramda')

const callob = R.curry((obj, fn) => {
    const callableObj = fn
    for (const key in obj) callableObj[key] = obj[key]
    return callableObj
})

const callWith = ({ fn, prop, value }) => callob({
    setting: destProp => data => (
        data[destProp] = fn(prop ? data[prop] : value || data),
        data        
    )
})( data => ( fn(prop ? data[prop] : value || data), data ) )

const call = fn => callob({
    using: prop => callWith({ fn, prop }),
    with: value => callWith({ fn, value }),
    setting: destProp => data => callWith({ fn }).setting(destProp)(data)
})( data => ( fn(data), data ) )

const chain = (obj = {}) => Promise.resolve(obj)

const arrToObj = (sourceArray, propsArray) => propsArray.reduce(
    (destObj, destProp, arrayIndex) => R.assoc(
        destProp, sourceArray[arrayIndex], destObj
    ), {}
)

const objsArrayToObjMap = (srcObjArray, destObjKey) => srcObjArray.reduce(
    (destObj, srcObj) => R.assoc(
        srcObj[destObjKey], R.dissoc(destObjKey, srcObj), destObj
    ), {}
)

const natSort = R.sort(
    new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare
)

module.exports = {
    arrToObj,
    call,
    callob,
    chain,
    natSort,
    objsArrayToObjMap
}
