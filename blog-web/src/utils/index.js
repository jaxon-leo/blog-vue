var vm;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // 当页面隐藏时
        document.title = "您离开啦o(>﹏<)o"
    } else {
        // 当页面可见时
        document.title = "快来关注我们吧(◕‿◕)O快快点击~"

        window.setTimeout(() => {
            document.title = "我们的网站-从科学到艺术的完美旅程"
        }, 800)
    }
}, false);

// 阻止右键菜单
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();  // 阻止默认右键菜单
});

// 阻止F12键
document.addEventListener('keydown', function (e) {
    if (e.key == 'F12') {
        e.preventDefault(); // 如果按下F12，阻止默认行为
    }
});

/* 样式 */
var styleTitle1 = `
font-size: 20px;
font-weight: 600;
color: rgb(244,167,89);
`
var styleTitle2 = `
font-style: oblique;
font-size:14px;
color: rgb(244,167,89);
font-weight: 400;
`
var styleContent = `
color: rgb(30,152,255);
`

/* 内容 */
var title1 = '🔥 我们的精彩网站 '

var offiUrl = 'https://dejavu.zone/'
var content = `
欢迎 版本 1.0    
更新时间: ${new Date()}
联系方式:
1. 点击链接查看更多内容.
链接地址:  ${offiUrl}
微信/QQ: 1234567890
`
if (import.meta.env.DEV) {
  console.log(`%c${title1}\n%c${content}`, styleTitle1, styleContent)
}
