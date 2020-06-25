# mockserver

这个项目是模拟`token-sdk-server`在服务端的使用情况。它与mockvue项目中的`上传私密文件 / 服务端pvdata / 申请证书 / 待签发证书`配合使用。
服务端保存着didttm文件、pvdata.前端可使用已经开放的用户操作页面执行相应操作。前端不保存didttm/pvdata。
服务端的功能包括：
1. 申请证书。
2. 请求保存证书临时数据。
3. 请求证书临时数据。
4. 生成签发证书的url.
5. 取消证书。
6. 生成海报页面的数据。
7. 签发证书。
8. 接收需要签发的证书。
9. 导入didttm.
10. 请求并保存pvdata.