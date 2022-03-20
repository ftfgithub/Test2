// 这个模块，主要获取品牌管理数据模块
import request from '@/utils/request'
// 获取品牌列表
// /admin/product/baseTrademark/{page}/{limit}
export const reqTradeMarkList = (page, limit) => request({ url: `/admin/product/baseTrademark/${page}/${limit}`, method: 'get' });

// 添加品牌
// /admin/product/baseTrademark/save method post 携带两个参数 品牌名称，品牌logo
// 切记，对于新增的品牌，给服务器传递数据，不需要传递id id是服务器生产

// 修改品牌
// /admin/product/baseTrademark/update    put  携带三个参数，品牌id 品牌名称 品牌logo
// 切记，对于修改某一个品牌的操作，前段携带参数需要带上id 你需要高速服务器需要修改的哪一个品牌
export const reqAddOrUpdateTradeMark = (tradeMark)=>{
    // 带给服务器数据带id就是修改
    if(tradeMark.id){
        return request({ url:' /admin/product/baseTrademark/update',method:'put',data:tradeMark})
    }else{
        // 新增品牌
        return request({ url:'/admin/product/baseTrademark/save',method:'post',data:tradeMark})
    }
}

// 删除品牌
// /admin/product/baseTrademark/remove/{id}
export const reqDeleteTradeMark = (id) => request({ url:`/admin/product/baseTrademark/remove/${id}`,method:'delete'})