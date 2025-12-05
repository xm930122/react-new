

const formatChartsData = (colmnList, data) => {
    // const column = [...colmnList]
    colmnList.forEach(it => {
        data.map(i => {
            if (it.dataType === 'Precent') {
                // it.key 
                i[it.key] = i[it.key] * 100 || null;
            } else if (it.dataType === 'Number') {
                i[it.key] = i[it.key] || null;
            } else  {
                i[it.key] = i[it.key] || null
            }
        })
    })
    return data;
}

const colmnList1 = [
    {
        key: 'a',
        dataType: 'Precent'
    },
    {
        key: 'b',
        dataType: 'Precent'
    },
    {
        key: 'c',
        dataType: 'Number'
    },
    {
        key: 'd',
        dataType: 'Precent'
    }
]

const chartata = [
    {
        a: 1,
        b: 2.03,
        c: 30,
        e: 10
    },
    {
        a: 2,
        b: 5.03,
        c: 50,
        e: 10
    },
    {
        a: 4,
        b: 3.03,
        c: 30,
        e: 10
    },
    {
        a: 2,
        b: 4.03,
        c: 50,
        e: 10
    }
]

const a1 = formatChartsData(colmnList1, chartata);

console.log(a1);