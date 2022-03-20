import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import {anyRoutes, resetRouter,asyncRoutes,constantRoutes} from '@/router'
import router from '@/router'
const getDefaultState = () => {
  return {
    token: getToken(),
    // 存储用户信息
    name: '',
    avatar: '',
    // 菜单标记 服务器返回的菜单信息，根据不同那个角色，返回的标记信息，数组里面元素是字符串
    routes:[],
    // 角色信息
    roles:[],
    // 按钮权限信息
    buttons:[],
    // 对比【项目中已有的异步路由与服务器返回的标记信息进行对比最终需要展示的路由】之后的
    reslutAsyncRoutes:[],
    // 用户最终展示的全部路由
    resultAllRoutes:[]
  }
}

const state = getDefaultState()
// 唯一修改state的地方
const mutations = {
  // 重置state
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  // 存储token
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // 存储用户信息
    SET_USERINFO:(state,userInfo)=>{
      // 用户名
      state.name=userInfo.name
      // 用户头像
      state.avatar = userInfo.avatar
      // 菜单权限标记
      state.routes = userInfo.routes
      // 按钮权限标记
      state.buttons = userInfo.buttons
      // 角色信息
      state.roles = userInfo.roles
    },
    // 最终计算出来的异步路由
  SET_RESULTASYNCROUTES:(state,asyncRoutes)=>{
    // vuex保存当前用户的异步路由，注意：应该用徐需要展示的路由包括：常量，异步。任意路由
    state.reslutAsyncRoutes = asyncRoutes
    // 计算当前用户需要展示的所有路由
     state.resultAllRoutes= constantRoutes.concat(state.reslutAsyncRoutes,anyRoutes)
    //  给路由器添加新路由
    router.addRoutes(state.resultAllRoutes)
  }
}
// 定义一个函数：两个数组进行对比，对比出当前的用户到底显示哪些异步路由
const computedAsyncRoutes = (asyncRoutes, routes) => {
  //过滤出当前用户【超级管理|普通员工】需要展示的异步路由
  return asyncRoutes.filter(item => {
    //数组当中没有这个元素返回索引值-1，如果有这个元素返回的索引值一定不是-1 
    if (routes.indexOf(item.name) != -1) {
      //递归:别忘记还有2、3、4、5、6级路由
      if (item.children && item.children.length) {
        item.children = computedAsyncRoutes(item.children, routes);
      }
      return true;
    }
  })
}
const actions = {
  //登录业务
 async login({ commit }, userInfo) {
    // 解构用户名密码
    const { username, password } = userInfo
   let result = await login({username:username.trim(),password:password})
  //  当前登录用的是mock数据，mock数据code是20000
   if(result.code==20000){
     commit('SET_TOKEN',result.data.token)
     setToken(result.data.token)
     return 'ok'
   }else{
     return Promise.reject(new Error('faile'))
   }
    // return new Promise((resolve, reject) => {
    //   login({ username: username.trim(), password: password }).then(response => {
    //     const { data } = response
    //     commit('SET_TOKEN', data.token)
    //     setToken(data.token)
    //     resolve()
    //   }).catch(error => {
    //     reject(error)
    //   })
    // })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        // 获取用户信息：返回数据包含：用户名name、用户头像avatar、routes【返回的标志不同用户应该展示哪些菜单的标记】、role（用户角色信息）、buttons【按钮的信息、按钮权限用的标记】
        const { data } = response
        // vuex存储的全部的用户信息
        commit('SET_USERINFO',data)

        commit('SET_RESULTASYNCROUTES', computedAsyncRoutes(asyncRoutes,data.routes))
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
    
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

