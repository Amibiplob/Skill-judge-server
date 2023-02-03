// async function createOR(fieldNames, keyword) {
//     var query = [];
//     fieldNames.forEach(function (item) {
//         var temp = {};
//         temp[item] = { $regex: ".*" + keyword + ".*" };
//         query.push(temp);
//     });
//     if (query.length == 0) return false;
//     return { $or: query };
// }

async function keys(collectionName, dbName) {
    let mr = await dbName.command({
       'mapreduce': collectionName,
        'map': function () {
            for (var key in this) { emit(key, null); }
        },
        'reduce': function (key, stuff) { return null; },
        'out': 'my_collection' + '_keys'
    });
    console.log(dbName[mr.result].distinct("_id"), "promise");
    return dbName[mr.result].distinct("_id");
}

async function findany(collection, keyword, dbName) {
    var query = keys(collection["name"], dbName);
    query.then(function (result) {
        if (result) {
            console.log(result, "result")
            return collection["name"].findOne(query, keyword);
        } else {
            return false;
        } // "Some User token"
    });
}

function searchAll(keyword, dbName) {
    var results = [];
    dbName.listCollections().toArray(function (err, items) {
        items.forEach(function (collectionName) {
            if (collectionName)
                results.push(findany(collectionName, keyword, dbName));
        });
        return results;
    });
}

module.exports = searchAll;
