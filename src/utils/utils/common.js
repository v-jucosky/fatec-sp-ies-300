function arrayUpdate(snapshot, array, setArray) {
    snapshot.docChanges()
        .forEach(change => {
            if (change.type === 'added') {
                console.log('added');
                setArray(content => [...content, { id: change.doc.id, ...change.doc.data() }]);
            } else if (change.type === 'removed') {
                console.log('removed');
                setArray(content => content.filter(object => object.id !== change.doc.id));
            } else if (change.type === 'modified') {
                console.log('modified');
            };
        });
};

function objectUpdate(snapshot, object, setObject) {
    setObject(snapshot.data());
};

export { arrayUpdate, objectUpdate };
