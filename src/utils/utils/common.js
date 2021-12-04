import { DEBUG } from "../settings/app";

function arrayUpdate(snapshot, setArray, index) {
    snapshot.docChanges()
        .forEach(change => {
            if (change.type === 'added') {
                if (index) {
                    if (DEBUG) console.log('Added object to sorted array: ', change.doc.data());

                    setArray(content => [...content, { id: change.doc.id, ...change.doc.data() }].sort((a, b) => {
                        return parseInt(a[index]) - parseInt(b[index]);
                    }));
                } else {
                    if (DEBUG) console.log('Added object to array: ', change.doc.data());

                    setArray(content => [...content, { id: change.doc.id, ...change.doc.data() }]);
                };
            } else if (change.type === 'removed') {
                if (DEBUG) console.log('Removed object from array: ', change.doc.data());

                setArray(content => content.filter(object => object.id !== change.doc.id));
            } else if (change.type === 'modified') {
                if (DEBUG) console.log('Modified object in array: ', change.doc.data());

                setArray(content => content.map(object => object.id === change.doc.id ? { id: change.doc.id, ...change.doc.data() } : object));
            };
        });
};

function objectUpdate(snapshot, setObject) {
    if (DEBUG) console.log('Updated object: ', snapshot.data());

    setObject({ id: snapshot.id, ...snapshot.data() });
};

export { arrayUpdate, objectUpdate };
