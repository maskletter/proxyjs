# proxyjs
监听拦截数据编号

## 在html中使用
```html
<script src="./proxy.js"></script>
<script>
  const school = [
      { id: 1, name: '北京大学' },
      { id: 2, name: '河北大学' },
      {
          test1: {
              name: 'test1',
              test2: {
                  name: 'test2',
                  test3: {
                      name: 'test3'
                  }
              }
          }
      }
  ]
  const data = DataProxy({ name: 'tom', age: 13, text: { school: school } }, (val) => {
      //监听所有数据变化
      console.log(val)
  });
  
  //单独监听某object数据
  watch(data.text.school, (value) => {
        console.log('监听school',value)
  })
  //单独监听某具体值数据
  watch(data.text.school[0], 'name', (value) => {
      console.log('监听school[0].name',value)
  })
</script>
```

## 在小程序中使用
```js
import { watch, FormatPath, DataProxy } from './proxy';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: false,
    username: 'tom',
    password: '123456',
    school: [
      { id: 1, name: '北京大学' },
      { id: 2, name: '河北大学' },
    ],
    test: {
      name: '张三',
      age: 12,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.vm_data = DataProxy(this.data, val => {
      if(val.type == 'delete') {
        val.path.pop()
        this.setData({ [FormatPath(val.path)]: val.parent })
      } else {
        this.setData({ [FormatPath(val.path)]: val.data })
      }
    })
    watch(this.vm_data.school, (val) => {
      console.log(val.parent.length)
    })
     
    setTimeout(() => {
      this.vm_data.school.splice(1,1)
    }, 2000)
    
  },

})
```
