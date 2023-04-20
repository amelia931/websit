import config from "./config.js";
import encryption from "./jm.js";

$(function () {
  let agreeXy = true; // 同意充值协议
  let qrFlag = true; // 防止多次订单生成
  let userUnionId = ""; // 用户声优圈号
  let nickName = ""; // 用户昵称
  let money = 1; // 显示money
  let userId; // 用户ID
  let customPrice; // 自定义价格
  let diamondPackageId; // 钻石套餐ID
  let payType; // 支付渠道
  let payWay = 4; // 支付方式
  let orderNo; // 订单号
  let confirmFlag = false; // 确认订单flag
  let confirmTimer; // 查询订单状态的定时器
  let cancelClicked = false; // 取消是否被点击
  let customInputTemp = ""; // 自定义价格缓存

  getPayWay();
  getDiamondList();

  /* ----- 用户输入id ----- */
  $("#target-id").bind("input propertychange blur", checkUnionId);

  /* ----- 自定义价格输入 ----- */
  $(".custom-price").on("input", () => {
    const regex = /^(500|[1-4][0-9][0-9]|[1-9][0-9]|[1-9])$/;
    const customNum = $(".custom-price").val();

    if ($(".custom-price").val() == "") {
      customInputTemp = "";
      customPrice = "";
      $("#submit-btn").html("正在输入...");
      $(".custom-price").parent().removeClass("isRight");
      return;
    }

    if (regex.test(customNum)) {
      customInputTemp = customNum;
      customPrice = customNum;
      money = customNum;
      $(".custom-price")
        .parent()
        .removeClass("noRight")
        .addClass("isRight")
        .attr("data-money", customNum * 100 + "钻");
      $("#submit-btn").html("确定支付" + customPrice + "元");
    } else {
      customPrice = customInputTemp;
      $(".custom-price").parent().removeClass("isRight").addClass("noRight");

      if (customInputTemp === "") {
        $("#submit-btn").html("正在输入...");
        setTimeout(() => {
          $(".custom-price").parent().removeClass("isRight noRight");
        }, 700);
      } else {
        $("#submit-btn").html("确定支付" + customPrice + "元");
        setTimeout(() => {
          $(".custom-price")
            .parent()
            .addClass("isRight")
            .removeClass("noRight");
        }, 700);
      }
    }

    $(".custom-price").val(customInputTemp);
  });

  /* ----- 协议确认 ----- */
  $("#agreeXyCheck").on("change", () => {
    agreeXy = !agreeXy;
    if (agreeXy) {
      $(".agreeXy").hide();
    }
  });

  /* ----- 支付按钮点击 ----- */
  $("#submit-btn").click(() => {
    if (agreeXy) {
      if (userId != "") {
        if (customPrice == "" && diamondPackageId == -1) {
          $("#submit-btn").html("请先输入金额");
          return;
        } else {
          $(".dialog-tip").html(
            `是否为ID为${userUnionId}，昵称为${nickName}的用户充值￥${money}？`
          );
          $(".mask-1").show();
        }
      } else {
        $(".warn").show();
        $(".warn").html("请先输入正确ID");
      }
    } else {
      $(".agreeXy").show();
    }
  });

  /* ----- 确认充值弹窗 取消按钮 ----- */
  $(".qx").click(() => {
    $(".mask-1").hide();
  });

  /* ----- 确认充值弹窗 确认按钮 ----- */
  $(".qr").click(() => {
    cancelClicked = false;
    if (qrFlag) {
      qr();
    }
    qrFlag = false;
  });

  /* ----- 二维码弹窗取消点击事件 ----- */
  $(".cancel").click(() => {
    $(".mask-2").hide();
    $(".code").html("");
    cancelClicked = true;
  });

  /* ----- 获取钻石列表 ----- */
  async function getDiamondList() {
    let data = await encryption({
      platform: 1,
      type: 1,
    });
    $.get(
      config.baseUrl + "/op/diamondPackage/list",
      data,
      function (resp) {
        if (resp.code == 0) {
          let html = "";
          for (let i = 0; i < resp.data.length; i++) {
            html += `<li val='${resp.data[i].price}'id='${resp.data[i].id}'><span>${resp.data[i].diamond}钻</span><span>${resp.data[i].price}元</span></li>`;
          }
          $(".pay-mount").prepend(html).children().eq(0).addClass("choosed");
          diamondPackageId = $(".pay-mount").children().eq(0).attr("id");
          customPrice = $(".pay-mount").children().eq(0).attr("val");
          $("#submit-btn").html("确定支付" + customPrice + "元");
        } else {
          $(".mask-3").show();
        }
        $(".pay-mount li").on("click", this, function () {
          $(this).addClass("choosed").siblings().removeClass("choosed");
          diamondPackageId = $(this).attr("id");

          if (diamondPackageId == -1) {
            if ($(".custom-price").val() == "") {
              $(".custom-price").parent().removeClass("noRight");
              $("#submit-btn").html("正在输入...");
            }
          } else {
            customPrice = "";
            money = $(this).attr("val");
            $("#submit-btn").html("确定支付" + money + "元");
            $(".custom-price").val("").parent().removeClass("noRight isRight");
          }
        });
      },
      "json"
    );
    return false;
  }

  /* ----- 获取支付渠道 ----- */
  async function getPayWay() {
    let data = await encryption({
      payWay: payWay,
    });
    $.get(
      config.baseUrl + "/tran/payInfo/list",
      data,
      function (resp) {
        payType = resp.data[0].payType;
        payWay = resp.data[0].payWay;
        let html = "";
        for (let i = 0; i < resp.data.length; i++) {
          html += `<span data-type="${resp.data[i].payType}" data-way="${resp.data[i].payWay}" class="pay-border pay-btn"><img src="${resp.data[i].icon}"  alt="支付方式logo"><span>${resp.data[i].name}</span></span>`;
        }
        $(".pay-way-box").html(html).children().eq(0).addClass("choosed");
        $(".pay-btn").on("click", this, function () {
          $(this).addClass("choosed").siblings().removeClass("choosed");
          payType = $(this).attr("data-type") * 1;
          payWay = $(this).attr("data-way") * 1;
        });
      },
      "json"
    );
  }

  /* ----- 检测输入的用户ID ----- */
  function checkUnionId() {
    const regex = /^[0-9]*$/;
    userUnionId = $("#target-id").val();

    if (!regex.test(userUnionId)) {
      userId = "";
      $(".warn").show();
      $(".warn").html("请输入正确ID");
      $("#id-input").removeClass("choosed");
      return;
    }

    if (userUnionId == "") {
      userId = "";
      $(".warn").show();
      $(".warn").html("请先输入ID");
      return;
    }
    let data = {
      unionId: userUnionId,
    };
    $.get(
      config.baseUrl + "/user/union/search",
      data,
      function (resp) {
        if (resp.data && resp.data.unionId) {
          nickName = resp.data.nickName;
          userId = resp.data.id;
          $(".warn").show();
          $(".warn").html("账号昵称：" + nickName);
          $("#id-input").addClass("choosed");
        } else {
          userId = "";
          $(".warn").show();
          $(".warn").html("该ID不存在或还未完成注册");
          $("#id-input").removeClass("choosed");
        }
      },
      "json"
    );
    return false;
  }

  /* ----- 确认弹窗 ----- */
  function qr() {
    $(".mask-1").hide();
    $(".loading-mask").show();
    let data = {
      payType: payType,
      payWay: payWay,
      diamondPackageId: diamondPackageId,
      platform: "1",
      userId: userId,
      price: customPrice,
    };
    $.ajax({
      url: config.baseUrl + "/tran/diamondRechargeOrder/unified",
      type: "post",
      dataType: "json",
      data: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      success: function (resp) {
        orderNo = resp.data.orderNo;

        qrFlag = true;
        // 获取新url
        let str = "alipays://platformapi/startApp?appId=20000067&url=";
        let r = resp.data.orderInfo.indexOf(str);
        if (r != -1) {
          //  匹配成功
          var urlstr = resp.data.orderInfo.replace("?", "");
          var params = urlstr.split("&");
          var returnParam = {};
          params.forEach(function (param) {
            var paramSplit = param.split("=");
            returnParam[paramSplit[0]] = paramSplit[1];
          });
          if (returnParam.url) {
            $(".code").html("");
            $(".loading-mask").hide();
            $(".mask-2").show();
            let l = $(".dialog-erweima").width() * 0.8;
            $(".code").qrcode({
              width: l,
              height: l,
              render: "canvas",
              typeNumber: -1,
              correctLevel: 0,
              background: "#ffffff",
              foreground: "#000000",
              text: decodeURIComponent(returnParam.url),
            });
            if (payType == 2) {
              $(".type-tips").html("请用支付宝扫码完成支付");
            } else {
              $(".type-tips").html("请用微信扫码完成支付");
            }
          }
        } else {
          let r = resp.data.orderInfo.indexOf(
            "/tran/diamondRechargeOrder/qrCode"
          );
          if (r != -1) {
            $(".code").html("");
            $(".loading-mask").hide();
            $(".mask-2").show();

            $(".code").html(`<img src="${resp.data.orderInfo}" alt="">`);
          } else {
            $(".code").html("");
            $(".loading-mask").hide();
            $(".mask-2").show();

            let l = $(".code").width();
            $(".code").qrcode({
              width: l,
              height: l,
              render: "canvas",
              typeNumber: -1,
              correctLevel: 0,
              background: "#ffffff",
              foreground: "#000000",
              text: decodeURIComponent(resp.data.orderInfo),
            });
          }
          if (payType == 2) {
            $(".type-tips").html("请用支付宝扫码支付");
          } else {
            $(".type-tips").html("请用微信扫码支付");
          }

          confirmFlag = true;
          confirmOrder();
        }
      },
      error: function (error) {
        qrFlag = true;
        $(".loading-mask").hide();
        $(".mask-3").html(`<p>${error.responseJSON.message}</p>`).show();
      },
    });
  }

  /* ----- 向后台确认订单订单状态 ----- */
  function confirmOrder() {
    confirmTimer = setTimeout(() => {
      const data = {
        orderNo,
        userId,
      };

      $.get(
        config.baseUrl + "/tran/diamondRechargeOrder/queryOrder",
        data,
        function (resp) {
          // 1：未支付 2：已完成 3：已退款 4：已取消
          switch (resp.data.payStatus) {
            case 1:
              if (!cancelClicked) {
                confirmOrder();
              }
              break;
            case 2:
              $(".mask-2").hide();
              if (confirmFlag) {
                $(".mask-4").html(`<p>充值成功，祝您生活愉快</p>`).show();
                confirmFlag = false;
              }

              setTimeout(() => {
                $(".mask-4").hide();
              }, 1500);

              clearTimeout(confirmTimer);
              return;
            case 3:
              break;
            case 4:
              $(".mask-2").hide();

              if (confirmFlag) {
                $(".mask-4").html(`<p>已为您取消订单，祝您生活愉快</p>`).show();
                confirmFlag = false;
              }

              setTimeout(() => {
                $(".mask-4").hide();
              }, 1500);
              clearTimeout(confirmTimer);
              return;
            default:
              break;
          }
        },
        "json"
      );

      clearTimeout(confirmTimer);
    }, 1000);
  }
});
