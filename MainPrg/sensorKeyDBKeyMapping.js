const DbKeyMapping = [
    {type:1, data:[
        {raw:"T", Db:"temperature"},
        {raw:"H", Db:"humidity"},
    ]}
]


function cvrtRawKeyToDbKey(type, rawKey){
    let found = DbKeyMapping.find(c=>c.type === type);
    if(!found || !found.data || !Array.isArray(found.data)) return

    let foundKey = found.data.find(c=>c.raw === rawKey);
    return foundKey.Db;
}
function cvrtDbKeyToRawKey(type, dbKey){
    let found = DbKeyMapping.find(c=>c.type === type);
    if(!found || !found.data || !Array.isArray(found.data)) return

    let foundKey = found.data.find(c=>c.Db === dbKey);
    return foundKey.raw;
}

exports.cvrtRawKeyToDbKey = cvrtRawKeyToDbKey;
exports.cvrtDbKeyToRawKey = cvrtDbKeyToRawKey;