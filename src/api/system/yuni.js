import request from '@/utils/request'

// 查询公告列表
export function getQRCode(packageId) {
  return request({
    url: '/getQRCode',
    method: 'get',
    params: {packageId}
  })
}
export function getStatus(uuid) {
    return request({
        url: '/getStatus',
        method: 'get',
        params: {uuid}
    })
}

export function listByAccountId() {
    return request({
        url: '/userInfo/listByAccountId',
        method: 'get',
    })
}

export function listSendRecordByUid(uid) {
    return request({
        url: '/sendRecord/listByUid',
        method: 'get',
        params: {uid}
    })
}

export function listPackagesByStatus(status = 0, pageNum = 1, pageSize = 1000) {
    return request({
        url: '/userPackage/listByAccountIdAndStatus',
        method: 'get',
        params: { status, pageNum, pageSize }
    })
}
export function addTask(form) {
    return request({
        url: '/task/addTask',
        method: 'post',
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export function addBatchTask(form) {
    return request({
        url: '/task/addBatchTask',
        method: 'post',
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export function updateFrequency(form) {
    return request({
        url: '/task/updateFrequency',
        method: 'post',
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export function deleteUser(id) {
    return request({
        url: '/userInfo/delete',
        method: 'get',
        params: {id}
    })
}

export function stopTask(uid, cvsType) {
    return request({
        url: '/task/stopTask',
        method: 'get',
        params: {uid, cvsType}
    })
}

export function stopAllTask(uids) {
    return request({
        url: '/task/stopAllTask',
        method: 'get',
        params: {uids}
    })
}

// 查询公告详细
export function getNotice(noticeId) {
  return request({
    url: '/system/match/' + noticeId,
    method: 'get'
  })
}

// 新增公告
export function addNotice(data) {
  return request({
    url: '/system/match',
    method: 'post',
    data: data
  })
}

// 修改公告
export function updateNotice(data) {
  return request({
    url: '/system/match',
    method: 'put',
    data: data
  })
}

// 删除公告
export function delNotice(noticeId) {
  return request({
    url: '/system/match/' + noticeId,
    method: 'delete'
  })
}
