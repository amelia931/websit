import config from './config.js';

/* ----- 加密 ----- */
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
};

function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())
};

function sort_ASCII(obj) {
    var arr = new Array();
    var num = 0;
    for (var i in obj) {
        arr[num] = i;
        num++
    }
    var sortArr = arr.sort();
    return sortArr
};

function encryption(data) {
    if (!data) data = {};
    data.nonceStr = guid();
    return new Promise((relove, reject) => {
        $.ajax({
            type: 'get',
            url: config.baseUrl + '/auth/system/curTime',
            dataType: 'json',
            headers: {
                "content-type": "application/json;charset=utf-8"
            },
            success: function (res) {
                if (res.code == 0) {
                    data.timestamp = res.timestamp;
                    let sortArr = sort_ASCII(data);
                    let sign = '';
                    for (let i = 0; i < sortArr.length; i++) {
                        let key = sortArr[i];
                        if (!!data[key] && data[key] !== 0) {
                            sign += `${key}=${data[key]}&`
                        }
                    }
                    if (sign.length > 1) {
                        sign = sign.substr(0, sign.length - 1)
                    }
                    sign += `&key=${config.SK}`;
                    let hash = CryptoJS.HmacSHA256(sign, config.SK).toString();
                    hash = hash.toLocaleUpperCase();
                    data.sign = hash;
                    relove(data)
                }
            },
            error: function () {}
        })
    })
}

export default encryption;