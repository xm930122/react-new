import React, { useState } from 'react'
import { ToPrecision } from '../utils/base';
// import {ColorContext, UPDATE_COLOR} from './Color'

function NumFunction(){
    const num1 = 10;
    const [num, setNum] = useState(num1);

    const handleToPrecision = () => {
        setNum(ToPrecision(num));
        console.log(ToPrecision(num), 'ToPrecision(num)--------')
    };

    return (
        <div>
            <div>
                <span>{num1}保留小数位数字处理：</span>
                <button onClick={handleToPrecision}>保留3位小数位</button>
                <span>{num}</span>


            </div>
        </div>
    )
}

export default NumFunction;