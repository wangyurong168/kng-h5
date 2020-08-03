import AppProtocol from '@/static/appprotocol'
// 是否在壳里
window.isApp = window.yxt.client === 'yxtapp'

window.testOrgId = 'b1df5d73-b5fc-414e-8997-5e55f758926c'

const u = navigator.userAgent.toLowerCase()
let isIOS = !!u.match(/\(i[^;]+;?( u;)? cpu.+mac os x/)

window.isIOS = isIOS

window.AppProtocol = AppProtocol
