/******************************/
/********获取页面的元素*********/
/******************************/
const tip = document.querySelector('.tip');//输入错误弹出的提示
const loginBtn = document.querySelector('#login');//按钮 已有账号，直接登录
const registerBtn = document.querySelector('#register');//按钮 没有账号，点击注册
const login = document.querySelector('.login');//按钮 点击登录的
const register = document.querySelector('.register');//按钮 点击注册的

const firstForm = document.querySelector('#form1');//整个注册的框
const secondForm = document.querySelector('#form2');//整个登录的框
const container = document.querySelector('.container');//整个大框

const nightBtn = document.querySelector('.night') //夜间模式的按钮

const user = document.querySelector('.name'); //用户的名字
const page = document.querySelector('.page');//整个功课表
// 周一到周日0~6  
// 周一 date.children[0] 以此类推
const date = document.querySelector('.date');
// 这个是最上面的大标题 第？周
const Week = document.querySelector('#week');
// 旁边的两个箭头
const leftArrow = document.querySelector('.arrow-left');
const rightArrow = document.querySelector('.arrow-right');

// 点击课程的弹窗
const mask = document.querySelector('.mask'); //遮罩层 点开窗口才有
const courseWindow = document.querySelector('#window'); //整个窗口
const courseWindowClose = courseWindow.querySelector('.close'); //小叉叉

const courseList = courseWindow.querySelector('.window-courses'); //div 用来放课程分类的
const courseInput = courseWindow.querySelectorAll('input'); //三个输入框
const updateBtn = courseWindow.querySelector('.update-course'); //更新课程的按钮
const deleteBtn = courseWindow.querySelector('.delete-course'); //删除课程的按钮
const menuBtn = courseWindow.querySelector('.menu') //点击下拉菜单

const column = document.querySelector('.column'); //右侧的视窗
const classifyList = column.querySelector('ul'); //用来加载课程分类的列表
const csfCreateBtn = column.querySelector('.create-classify'); //添加课程分类的按钮
const csfDeleteBtn = column.querySelector('.delete-classify'); //删除课程分类的按钮
const columnWindow = column.querySelector('.column-window'); //点击添加才弹出来的框
const submitBtn = columnWindow.querySelector('.column-submit'); //弹出的框的确认按钮

// 用Ajax请求的对象
const XHR = new XMLHttpRequest();
// 万能的token
let token = null;

// 点击开启夜间模式
let nightFlag = 1;
nightBtn.addEventListener('click', () => {
    if (nightFlag) {
        mask.style.display = 'block';
        mask.style.zIndex = 0;
        nightFlag = 0;
    } else {
        mask.style.display = 'none';
        mask.style.zIndex = 8888;
        nightFlag = 1;
    }
})

// 全局——禁止选中文字复制
document.addEventListener('selectstart', function (e) {
    // 文字不可被选中
    e.preventDefault();
})

// 已有账号 直接登录
loginBtn.addEventListener('click', function () {
    // 移除这个类名 使得遮罩框可以移动
    container.classList.remove('right-panel-active');
})

// 没有账号 点击注册
registerBtn.addEventListener('click', function () {
    // 重新添加这个类名 遮罩框移动回来
    container.classList.add('right-panel-active');
})

// 点击登录的按钮 
login.addEventListener('click', function () {
    // 获取登录框里面的账号密码
    const userName = document.querySelector('.login-username');
    const passWord = document.querySelector('.login-password');
    // 判断用户输入
    // 检测账号密码格式是否正确 
    // 如果错误重输
    // 如果正确则flag会赋值为true
    let flag = reg(userName, passWord);
    // 判断 如果正确了调用函数注册数据到后台
    if (flag) {
        userLogin(userName, passWord);
    }
})

// 点击注册的按钮
register.addEventListener('click', function () {
    // 获取注册框里面的账号密码
    const userName = document.querySelector('.register-username');
    const passWord = document.querySelector('.register-password');
    // 判断用户输入
    // 检测账号密码格式是否正确 
    // 如果错误重输
    // 如果正确则flag会赋值为true
    let flag = reg(userName, passWord);
    // 判断 如果正确了调用函数注册数据到后台
    if (flag) {
        userRegister(userName, passWord);
    }
})

// *正则判断1 账号密码格式
function reg(userName, passWord) {
    // 账号的正则表达式 2-16数字字母
    let regUserName = /^[0-9a-zA-Z]{2,16}$/;
    // 密码的正则表达式 6-16字符
    let regPassWord = /^[\w]{6,16}$/;
    // 判断账号密码 暂时没有bug 记得括号里面是&&
    if (userName.value == '' || passWord.value == '') {
        tipAlert('你好像还没输入吧!');
    } else if (!regUserName.test(userName.value) && !regPassWord.test(passWord.value)) {
        userName.value = '';
        passWord.value = '';
        tipAlert('账号密码格式都错了');
    } else if (regUserName.test(userName.value) && !regPassWord.test(passWord.value)) {
        userName.value = '';
        passWord.value = '';
        tipAlert('密码格式错了');
    } else if (!regUserName.test(userName.value) && regPassWord.test(passWord.value)) {
        userName.value = '';
        passWord.value = '';
        tipAlert('账号格式错了');
    } else {
        return true;
    }
}
// *正则判断2 输入的时间格式
function regTime(startTime, endTime) {
    // 这个正则表达式可以判断从0点到20点的日期格式
    // 把这些时间转化成数字 然后计算更改的时间是否会冲突
    let sT = startTime.value.split(':');
    let eT = endTime.value.split(':');
    let reg = /^(20|[0-1]\d):[0-5]\d$/;
    if (startTime.value == '' || endTime.value == '') {
        tipAlert('你好像还没输入吧!');
    } else if (!reg.test(startTime.value) || !reg.test(endTime.value) || sT[0] > eT[0] || (sT[0] == eT[0] && sT[1] >= eT[1])) {
        // 这个条件把基本能排除的全打回了
        tipAlert('时间格式错误');
    } else if (sT[0] < 8) {
        tipAlert('谁会在这个点上课啊')
    } else {
        return true;
    }
}

// *正则判断3 输入的周次和日期
function regDate(week, date) {
    const regWeek = /^20|[0-1]\d|[1-9]$/;
    const regDate = /^[1-7]$/;
    if (week.value == '' || date.value == '') {
        tipAlert('你好像还没输入吧!');
    } else if (!regWeek.test(week.value) || !regDate.test(date.value)) {
        tipAlert('周次日期格式有点错误!')
    } else {
        return true;
    }

}

// *弹窗提醒  各种情况下的弹窗 这个函数用于 在账号密码输错时出现弹窗提醒用户
function tipAlert(msg) {
    tip.innerHTML = msg;
    tip.style.transform = 'translate(-50%,-50%)';
    // 通过定时器把弹窗收起
    setTimeout(() => {
        tip.style.transform = 'translate(-50%,-50%) rotateX(90deg)';
    }, 1500)
}

// 一 注册接口
// *用户注册的函数
function userRegister(userName, passWord) {
    // Ajax请求
    XHR.open('POST', 'http://localhost:8081/user/register', false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("username=" + userName.value + "&password=" + passWord.value);

    let statusCode = JSON.parse(XHR.responseText).statusCode;
    if (statusCode == 400) {
        tipAlert('该用户已存在! 请直接登录');
        userName.value = '';
        passWord.value = '';
    } else if (statusCode == 201) {
        tipAlert('注册成功! 请登录');
        userName.value = '';
        passWord.value = '';
    }
}

// 二 登录接口
// *用户登录的函数
function userLogin(userName, passWord) {
    // Ajax请求
    XHR.open('POST', 'http://localhost:8081/user/login', false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("username=" + userName.value + "&password=" + passWord.value);

    const obj = JSON.parse(XHR.responseText);
    let statusCode = obj.statusCode;

    if (statusCode == 400) {
        tipAlert('密码错误! 也许你还没注册用户!');
        userName.value = '';
        passWord.value = '';
    } else if (statusCode == 200) {
        // 得到token 给他赋值
        const body = document.body;
        body.setAttribute('token', obj.data.token);
        token = obj.data.token;

        tipAlert('登录成功!马上跳转~');
        setTimeout(() => {
            container.style.display = 'none';
            page.style.display = 'grid';
            // 加载用户名
            user.style.display = 'block';
            user.innerHTML = userName.value;
        }, 500)
        setTimeout(() => {
            alert(userName.value + ', 你好! 正在为您加载课表~');
            // 首先调用这个 得到第一周的课表
            getCourse(1);
            setClassify();
        }, 1000)
    }
}


// 三 获取某周课表
// *得到某一周（week）的课程
function loadCourse(week) {
    // Ajax请求
    XHR.open('get', 'http://localhost:8081/course/' + week, false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.setRequestHeader('token', token);
    XHR.send();
    return JSON.parse(XHR.response);
}

// 把数据渲染到页面中
function getCourse(week) {
    Week.innerHTML = '第 ' + week + ' 周';
    // 把获取到的数据放在obj中
    let obj = loadCourse(week);
    // 提取课程对象obj
    let arr = obj.data;
    // 第一层for循环，循环从周一到周日
    for (let i = 0; i < arr.length; i++) {
        // 提取出每一天的课程
        let courses = arr[i].courses;
        // 第二次for循环 循环每一天的每一节课
        for (let j = 0; j < courses.length; j++) {
            // 创建一个新的div 带着这节课的详细信息
            let div = document.createElement('div');
            // 写入课程名字和上课地点
            div.innerHTML = courses[j].course + '<br>' + courses[j].location;
            // 把课程分类的id和课程id写入自定义属性里
            div.setAttribute('data-classifyId', courses[j].classifyId);
            div.setAttribute('data-id', courses[j].id);
            div.setAttribute('data-start-time', courses[j].startTime);
            div.setAttribute('data-end-time', courses[j].endTime);
            // 赋予样式
            div.className = 'class';
            // 调用高度函数 确定课程这个盒子的高度 定位
            calcTop(courses[j].startTime, courses[j].endTime, div);
            // 把这节课写入当天
            date.children[i].appendChild(div);

            // 给这个div加一个子节点 hovor的时候能看到上课的时间
        }
    }
    // 高亮当天的课程
    highLight();
    // 给得到的课绑定事件
    setAllClass();
}

// *算出课程的高度
function calcTop(startTime, endTime, className) {

    let fullTime = 840; //第十二节减去第一节的分钟数
    let baseTime = 480; //这个点是第一节课 8:30
    // 把起始和结束时间拆分成两个数组
    let sT = startTime.split(':');
    let eT = endTime.split(':');
    // 记得转化成数字 然后算出本节课的总分钟数
    let firstTime = Number(sT[0]) * 60 + Number(sT[1]); //起始分钟
    let lastTime = Number(eT[0]) * 60 + Number(eT[1]); //末尾分钟
    let courseTime = lastTime - firstTime;
    // 算出盒子的高度
    let height = (courseTime / fullTime) * 700; //600是一到十二节这一段的高度
    // 算出盒子的定位 top
    let top = (firstTime - baseTime) / fullTime * 700 + 50;
    className.style.height = height + 'px';
    className.style.top = top + 'px';

}

// 预加载清除当前的课程
function clearcourse() {
    for (let i = 0; i < 7; i++) {
        // 先把原先这一周的课清除
        // 注意要倒序删除 正序的话因为每删除一个结点lenth就会变化 导致没办法彻底删除
        for (let j = date.children[i].children.length - 1; j >= 0; j--) {
            date.children[i].removeChild(date.children[i].children[j]);
        }
    }
}

let num = 1; //起始是第一周
// *右箭头加载下一周
rightArrow.addEventListener('click', function () {
    num = (num == 20) ? 1 : num + 1;
    clearcourse();
    getCourse(num);
})

// *左箭头加载上一周
leftArrow.addEventListener('click', function () {
    num = (num == 1) ? 20 : num - 1;
    clearcourse();
    getCourse(num);
})

// 给所有的课程绑定点击事件 加载详细信息的弹窗
function setAllClass() {
    // 遍历所有的课表
    for (let i = 0; i < 7; i++) {
        // 每一天
        let day = date.children[i];
        // 第i+1天就是星期几
        for (let j = 0; j < day.children.length; j++) {
            // 获取每一节课
            let lesson = day.children[j];
            // 点击课程时 给弹窗绑定信息
            lesson.addEventListener('click', function () {
                // 弹窗打开 黑色遮罩出现
                mask.style.display = 'block';
                courseWindow.style.display = 'flex';
                courseList.innerText = lesson.firstChild.textContent;
                courseInput[0].value = num;
                courseInput[1].value = i + 1;
                courseInput[2].value = lesson.getAttribute('data-start-time');
                courseInput[3].value = lesson.getAttribute('data-end-time');
                courseInput[4].value = lesson.lastChild.textContent;

                // 给这个窗口加上自定义属性 方便调用修改的函数
                courseWindow.setAttribute('data-classifyId', lesson.getAttribute('data-classifyId'));
                courseWindow.setAttribute('data-id', lesson.getAttribute('data-id'));
                courseWindow.setAttribute('data-index', i + 1);
                courseWindow.setAttribute('data-start-time', lesson.getAttribute('data-start-time'));
                courseWindow.setAttribute('data-end-time', lesson.getAttribute('data-end-time'));
                courseWindow.className = lesson.lastChild.textContent;
                courseList.setAttribute('data-classifyId', lesson.getAttribute('data-classifyId'));

                // 课程分类加载
                const courseClassify = getClassfy();
                let ul = document.createElement('ul');
                courseList.appendChild(ul);
                for (let i = 0; i < courseClassify.length; i++) {
                    let li = document.createElement('li');
                    li.innerHTML = courseClassify[i].course;
                    li.setAttribute('data-classifyId', courseClassify[i].id);
                    // li.setAttribute('data-id', )
                    ul.appendChild(li);
                    li.addEventListener('click', () => {
                        courseList.firstChild.textContent = li.innerText;
                        ul.style.display = 'none';
                        menuBtn.style.transform = '';
                        courseList.setAttribute('data-classifyId', li.getAttribute('data-classifyId'));
                    })
                }
                // 绑定键盘事件
                document.addEventListener('keypress', function (e) {
                    if (e.key == 'Enter') {
                        // 如果按下回车相当于点击添加的按钮
                        updateBtn.click();
                    }
                })
            })
        }
    }
}

// *鼠标拖拽弹框
courseWindow.querySelector('h2').addEventListener('mousedown', (e) => {
    let x = e.pageX - courseWindow.offsetLeft;
    let y = e.pageY - courseWindow.offsetTop;
    document.addEventListener('mousemove', move)
    //鼠标移动的时候 把 鼠标在页面中的坐标 减去 鼠标在盒子中的坐标  就是模态框的left和top值
    function move(e) {
        courseWindow.style.left = e.pageX - x + 'px';
        courseWindow.style.top = e.pageY - y + 'px';
    }
    //鼠标弹起 就让鼠标移动事件移除
    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', move)
    })
})

// *点击x关闭窗口
courseWindowClose.addEventListener('click', () => {
    // 把窗口定位恢复到中心
    courseWindow.style.top = '50%';
    courseWindow.style.left = '50%';
    courseWindow.style.transform = 'translate(-50%, -50%)';
    courseWindow.style.display = 'none';
    mask.style.display = 'none';
    deleteBtn.style.display = 'block';
    // 把这个重设 下一次打开时三角形恢复原状
    menuBtnFlag = 1;
    courseList.querySelector('ul').style.display = 'none';
    menuBtn.style.transform = '';
    courseList.removeAttribute('data-classifyid');
})

// *点击三角形下拉菜单
let menuBtnFlag = 1;
menuBtn.addEventListener('click', () => {
    if (menuBtnFlag) {
        courseList.querySelector('ul').style.display = 'block';
        menuBtn.style.transform = 'rotateX(180deg)';
        menuBtnFlag = 0;
    } else {
        courseList.querySelector('ul').style.display = 'none';
        menuBtn.style.transform = '';
        menuBtnFlag = 1;
    }

})

// *删除课程按钮点击事件
deleteBtn.addEventListener('click', () => {
    deleteCourse(courseWindow.getAttribute('data-id'));
    tipAlert('操作成功!');
    setTimeout(() => {
        courseWindowClose.click();
    }, 500)
    clearcourse();
    getCourse(num);
})

// *添加/修改课程按钮点击事件
updateBtn.addEventListener('click', () => {
    // 正则判断日期时间这些输的对不对
    let flag1 = regTime(courseInput[2], courseInput[3]);
    let flag2 = regDate(courseInput[0], courseInput[1]);
    let flag3 = 1;
    if (courseList.getAttribute('data-classifyId') == null) {
        tipAlert('你还没选课程分类啊!');
        flag3 = 0;
    }
    if (flag1 && flag2 && flag3) {
        // 要把原来的课程删除 再开始遍历
        deleteBtn.click();
        let flag = createCourse(courseInput[0].value, courseInput[1].value, courseList.getAttribute('data-classifyId'), courseInput[2].value, courseInput[3].value, courseInput[4].value);
        // 如果被返回了 那么flag就会变成true 执行下面的语句
        if (flag) {
            createCourse(num, courseWindow.getAttribute('data-index'), courseWindow.getAttribute('data-classifyId'), courseWindow.getAttribute('data-start-time'), courseWindow.getAttribute('data-end-time'), courseWindow.className);
            tipAlert('该时间段已有课程! 操作失败!');
        } else {
            tipAlert('操作成功!');
        }
        setTimeout(() => {
            courseWindowClose.click();
        }, 500)
        clearcourse();
        getCourse(num);
    }
})


// 四 在课程表中添加一个课程
// *添加课程 添加某一节课
function createCourse(week, date, classifyId, startTime, endTime, location) {
    // 先把要添加的那一周的课表找出来
    const obj = loadCourse(week);
    const arr = obj.data[date - 1].courses;

    // 把要修改的时间转化成数字 然后计算更改的时间是否会冲突
    const startTimeArr = startTime.split(':');
    const endTimeArr = endTime.split(':');

    // 接下来for循环 遍历目标日有无重合日期
    for (let i = 0; i < arr.length; i++) {
        // 这是每节课的上课下课时间
        const sT = arr[i].startTime.split(':');
        const eT = arr[i].endTime.split(':');
        // 遇到以下情况 遇到冲突 无法添加
        if (!(startTimeArr[0] > eT[0] || (startTimeArr[0] == eT[0] && startTimeArr[1] > eT[1]) || endTimeArr[0] < sT[0] || (endTimeArr[0] == sT[0] && endTimeArr[1] < sT[1]))) {
            // 括号内的为 没有冲突到时间的情况 对其取反就得到冲突的了
            return true;
        }
    }
    // Ajax请求
    XHR.open('POST', 'http://localhost:8081/course', false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.setRequestHeader('token', token);
    XHR.send('week=' + week + '&date=' + date + '&classifyId=' + classifyId + '&startTime=' + startTime + '&endTime=' + endTime + '&location=' + location);
}

// 五 删除课程表中的一个课程
// *删除课程 删除某一节课
function deleteCourse(courseId) {
    // Ajax请求
    XHR.open('delete', 'http://localhost:8081/course/' + courseId, false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.setRequestHeader('token', token);
    XHR.send();
}


// *把课程分类写入到右边
function setClassify() {
    let obj = getClassfy();
    // 先清除原来列表里的课程
    classifyList.innerHTML = '';
    let flag = 1;
    // 把课程数据渲染到里面
    for (let i = 0; i < obj.length; i++) {
        let li = document.createElement('li');
        li.innerHTML = obj[i].course;
        li.className = 'li';
        li.setAttribute('data-classifyId', obj[i].id);
        classifyList.appendChild(li);

        li.addEventListener('mouseenter', () => {
            li.style.backgroundColor = 'rgb(89, 165, 219)';
        })
        li.addEventListener('mouseleave', () => {
            li.style.backgroundColor = 'rgba(89, 165, 219, .5)';
        })
        // 绑定点击事件
        li.addEventListener('click', () => {
            for (let i = 0; i < classifyList.children.length; i++) {
                classifyList.children[i].style.color = '#fff';
            }
            if (flag) {
                csfDeleteBtn.style.backgroundImage = 'linear-gradient(90deg, #0367a6 0%, #008997 74%)';
                csfDeleteBtn.style.cursor = 'pointer';
                csfDeleteBtn.setAttribute('data-classifyId', li.getAttribute('data-classifyId'));
                li.style.color = '#0367a6';

                flag = 0;
                csfDeleteBtn.addEventListener('click', () => {
                    deleteClassify(csfDeleteBtn.getAttribute('data-classifyId'));
                })
            } else {
                // li.style.color = '#fff';
                csfDeleteBtn.style.backgroundImage = 'linear-gradient(90deg, #0368a689 0%, #008897a1 74%)';
                csfDeleteBtn.style.cursor = 'default';
                csfDeleteBtn.removeAttribute('data-classifyId', li.getAttribute('data-classifyId'));
                flag = 1;
            }
        })
    }
}

// 六 获取所有课程分类
// *获取所有的课程分类
function getClassfy() {
    // Ajax请求
    XHR.open('get', 'http://localhost:8081/classify', false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.setRequestHeader('token', token);
    XHR.send();

    // XHR.responseText 是字符串，用json的办法转化为对象
    let obj = JSON.parse(XHR.responseText).data;
    return obj;
}

// 七 删除一个课程分类
// *删除某个课程分类
function deleteClassify(classifyId) {
    // Ajax请求
    XHR.open('delete', 'http://localhost:8081/classify/' + classifyId, false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.setRequestHeader('token', token);
    XHR.send();
    if (JSON.parse(XHR.responseText).statusCode == 200) {
        tipAlert('删除课程分类成功!');
        setClassify();
        // *然后把原有的课全删了
        for (let i = 1; i <= 20; i++) {
            // 遍历每周的课表
            let obj = loadCourse(i).data;
            for (let j = 0; j < obj.length; j++) {
                const arr = obj[j].courses;
                // 判断有没有id一样的课 有的话都删掉
                for (let k = 0; k < arr.length; k++) {
                    if (classifyId == arr[k].classifyId) {
                        // 如果找到一样的 调用删除的函数
                        deleteCourse(arr[k].id);
                    }
                }
            }

        }
        // 按键颜色恢复
        csfDeleteBtn.style.backgroundImage = 'linear-gradient(90deg, #0368a689 0%, #008897a1 74%)';
        csfDeleteBtn.style.cursor = 'default';
        // 再清除 重新加载一次
        clearcourse();
        getCourse(num);
    }
}

// 八 新增一个课程分类
// *新增课程分类
function createClassify(course) {
    // Ajax请求
    XHR.open('post', 'http://localhost:8081/classify/', false);
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.setRequestHeader('token', token);
    XHR.send('course=' + course);
    const obj = JSON.parse(XHR.responseText);
    if (obj.statusCode == 400) {
        tipAlert('该课程已存在!')
    } else {
        tipAlert('添加成功!');
        setClassify();
    }

}

// *点击 新增课程分类 时
csfCreateBtn.addEventListener('click', () => {
    // 弹出弹窗和遮罩
    mask.style.display = 'block';
    columnWindow.style.display = 'flex';
})

// *点击确认新增分类
submitBtn.addEventListener('click', () => {
    let course = columnWindow.querySelector('input').value;
    createClassify(course);
    columnWindow.querySelector('input').value = '';
    columnWindow.querySelector('.close').click();
})

// *窗口随鼠标拖拽移动
columnWindow.querySelector('h2').addEventListener('mousedown', (e) => {
    let x = e.pageX - columnWindow.offsetLeft;
    let y = e.pageY - columnWindow.offsetTop;
    document.addEventListener('mousemove', move)
    //鼠标移动的时候 把 鼠标在页面中的坐标 减去 鼠标在盒子中的坐标  就是模态框的left和top值
    function move(e) {
        columnWindow.style.left = e.pageX - x + 'px';
        columnWindow.style.top = e.pageY - y + 'px';
    }
    //鼠标弹起 就让鼠标移动事件移除
    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', move)
    })
})

// *点击x关掉
columnWindow.querySelector('.close').addEventListener('click', () => {
    mask.style.display = 'none';
    columnWindow.style.display = 'none';
    columnWindow.style.top = '50%';
    columnWindow.style.left = '50%';
    columnWindow.style.transform = 'translate(-50%, -50%)'

})

// *点击添加课程
const createBtn = document.querySelector('.create');
createBtn.addEventListener('click', () => {
    courseWindow.style.display = 'flex';
    mask.style.display = 'block';
    // 要把那个删除的按键隐藏 毕竟没得删
    deleteBtn.style.display = 'none';
    courseList.innerText = '选择课程分类';
    for (let i = 0; i < 5; i++) {
        courseInput[i].value = '';
    }
    const courseClassify = getClassfy();
    let ul = document.createElement('ul');
    courseList.appendChild(ul);
    for (let i = 0; i < courseClassify.length; i++) {
        let li = document.createElement('li');
        li.innerHTML = courseClassify[i].course;
        li.setAttribute('data-classifyId', courseClassify[i].id);
        ul.appendChild(li);
        li.addEventListener('click', () => {
            courseList.firstChild.textContent = li.innerText;
            ul.style.display = 'none';
            menuBtn.style.transform = '';
            courseList.setAttribute('data-classifyId', li.getAttribute('data-classifyId'));
        })
    }
    document.addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            // 如果按下回车相当于点击添加的按钮
            updateBtn.click();
        }
    })
})

// *高亮当天 星期几的课程
function highLight() {
    const Day = new Date;
    // 用日期对象得到今天星期几
    for (let i = 0; i < 7; i++) {
        // 和第一栏星期的数字比较
        let day = date.children[i].getAttribute('data-index');
        if (Day.getDay() == day) {
            const today = date.children[i];
            for (let i = 0; i < today.children.length; i++) {
                today.children[i].style.backgroundColor = '#2dbdc8';
            }
        }
    }
}

// 检查课程时间是否冲突 待更新
function checkCourse(week, date, startTime, endTime) {
    // 先把要添加的那一周的课表找出来
    const obj = loadCourse(week);
    const arr = obj.data[date - 1].courses;
    // 把这些时间转化成数字 然后计算更改的时间是否会冲突
    const startTimeArr = startTime.split(':');
    const endTimeArr = endTime.split(':');

    // 接下来for循环 遍历目标日有无重合日期
    for (let i = 0; i < arr.length; i++) {
        const sT = arr[i].startTime.split(':');
        const eT = arr[i].endTime.split(':');
        // 遇到以下情况 遇到冲突 无法添加
        if (!(startTimeArr[0] > eT[0] || (startTimeArr[0] == eT[0] && startTimeArr[1] > eT[1]) || endTimeArr[0] < sT[0] || (endTimeArr[0] == sT[0] && endTimeArr[1] < sT[1]))) {
            // 括号内的为 没有冲突到时间的情况 对其取反就得到冲突的了
            return false;
        }
    }
    return true;

}

//  九 更新课程 更新课程信息 
function updateCourse(week, date, id, classifyId, startTime, endTime, location) {
    // 先判断时间是否冲突
    const flag = checkCourse(week, date, startTime, endTime);
    if (flag) {
        // Ajax请求
        XHR.open('PATCH', 'http://localhost:8081/course', false);
        XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        XHR.setRequestHeader('token', token);
        XHR.send('id=' + id + '&classifyId=' + classifyId + '&startTime=' + startTime + '&endTime=' + endTime + '&location=' + location);
        console.log(id, classifyId, startTime, endTime, location);
        console.log(JSON.parse(XHR.response));
        console.log(0);
        tipAlert('操作成功!')
    } else {
        tipAlert('课程时间冲突! 操作失败');
        return false;
    }
}