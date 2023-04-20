import config from "./config.js";
import encryption from "../js/jm.js";

$(function () {
  let WeiXinIsTrue = false; // 判断是否为微信
  let qrFlag = true; // 防止重复的点击提交按钮
  let userUnionId = ""; // 用户声优圈号
  let nickName = ""; // 用户昵称
  let userValid = false; // 用户有效判定
  let agreeXy = true; // 协议同意
  let userId = ""; // 用户id
  let money = 1; // 自定义价格
  let customPrice = ""; // 自定义充值金额
  let diamondPackageId; // 钻石套餐id
  let payType; // 支付渠道
  let payWay = 2; // 默认支付方式
  let selectPayWay; // 选择的支付方式
  let orderNo; // 订单号
  let payWayHtml = ""; // 支付方式拼接内容字符串
  let customInputTemp = ""; // 自定义价格缓存

  /* ----- 获取焦点 ----- */
  $("#id-input").focus();
  /* ----- 右上角菜单按钮点击 ----- */
  $(".navBtn").click(toggleNavMask);
  $("#navBtn1").click(() => {
    window.location.href = "../index.html";
  });
  $("#navBtn2").click(() => {
    window.location.href = "../pages/m_about.html";
  });
  /* ----- 用户输入账号 ----- */
  $("#id-input").bind("input propertychange blur", checkUnionId);
  /* ----- 确认按钮点击 ----- */
  $("#submit-btn").click(checkSubmitStatus);
  /* ----- 用户协议checkbox勾选 ----- */
  $("#agreeXyCheck").click(agreeXyCheck);
  /* ----- 自定义价格输入 ----- */
  $("#custom-price").bind("input propertychange", customPriceInput);

  confirmOrder();
  checkUserAgent();
  getParams();
  getPayWay();
  getDiamondList();

  /* ----- 导航按钮点击效果 ----- */
  function toggleNavMask() {
    $(".navMask").toggle();
    $("header").toggleClass("active-header");
    $("header").toggleClass("white-bg");
    $(".navBtn span").toggleClass("active");
  }
  /* ----- 检查客户端 ----- */
  function checkUserAgent() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
      // 微信浏览器
      WeiXinIsTrue = true;
      payWay = 5; // 微信客户端对应为5
    } else {
      WeiXinIsTrue = false;
    }
  }
  /* ----- 获取支付渠道 ----- */
  async function getPayWay() {
    if (payWay === 5) {
      await doRquest(5);
      await doRquest(2);
    } else {
      await doRquest(2);
    }

    setDefaultValue();

    function doRquest(_payway) {
      return new Promise(async (resolve) => {
        let data = await encryption({
          payWay: _payway,
        });
        $.get(
          config.baseUrl + "/tran/payInfo/list",
          data,
          function (resp) {
            for (let i = 0; i < resp.data.length; i++) {
              payWayHtml += `<div payType="${resp.data[i].payType}"
                            payWay="${resp.data[i].payWay}">
                            <img class="icon" src="${resp.data[i].icon}">
                            <span>${resp.data[i].name}</span>
                            </div>`;
            }
            $(".pay-way-box").html(payWayHtml);
            $(".pay-way-box").children().eq(0).addClass("checked");
            $(".pay-way-box div").on("click", this, function () {
              $(this).addClass("checked").siblings().removeClass("checked");
              payType = $(this).attr("payType");
              selectPayWay = $(this).attr("payWay");
            });
            resolve();
          },
          "json"
        );
      });
    }

    function setDefaultValue() {
      payType = $(".pay-way-box div").eq(0).attr("payType");
      selectPayWay = $(".pay-way-box div").eq(0).attr("payWay");
    }
  }
  /* ----- 获取参数 ----- */
  async function getParams() {
    let searchHref = window.location.search.replace("?", "");
    let params = searchHref.split("&");
    let returnParam = {};
    params.forEach(function (param) {
      let paramSplit = param.split("=");
      returnParam[paramSplit[0]] = paramSplit[1];
    });
    if (!returnParam.unionId) {
      return;
    }
    $("#id-input").val(returnParam.unionId);
    let data = await encryption({
      unionId: returnParam.unionId,
    });
    $.get(
      config.baseUrl + "/user/union/search",
      data,
      function (resp) {
        if (resp.data.unionId) {
          nickName = resp.data.nickName;
          userId = resp.data.id;
          $(".warn")
            .css("opacity", "1")
            .html("账号昵称：" + nickName);
          $("#id-input").addClass("active");
          userValid = true;
        } else {
          userId = "";
          $(".warn").css("opacity", "1").html("该ID不存在或还未完成注册");
          $("#id-input").removeClass("active");
          userValid = false;
        }
      },
      "json"
    );
  }
  /* ----- 获取钻石列表 ----- */
  async function getDiamondList() {
    let data = await encryption({
      platform: "1",
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
          $(".cell ul").prepend(html).children().eq(0).addClass("choosed");
          diamondPackageId = $(".cell ul").children().eq(0).attr("id");
        } else {
          $(".fail-network").toggle();
        }
        $(".cell li").on("click", this, function () {
          $(this).addClass("choosed").siblings().removeClass("choosed");
          diamondPackageId = $(this).attr("id");
          if (diamondPackageId === "-1") {
            updateSubmitBtnText();
            $("#custom-price").attr("placeholder", "");
          } else {
            $("#custom-price").val("");
            customPrice = "";
            $("#custom-price").attr("placeholder", "自定义充值金额");
            money = $(this).attr("val");
            updateSubmitBtnText();
          }
        });
      },
      "json"
    );
  }
  /* ----- 自定义价格输入 ----- */
  function customPriceInput() {
    if ($("#custom-price").val() === "") {
      customInputTemp = "";
      customPrice = "";
      $("#custom-price").attr("placeholder", "自定义充值金额");
      updateSubmitBtnText();
    } else {
      const regex = /^(500|[1-4][0-9][0-9]|[1-9][0-9]|[1-9])$/;
      const customNum = $("#custom-price").val();
      if (regex.test(customNum)) {
        customInputTemp = customNum;
        customPrice = customNum;
        money = customNum;
        updateSubmitBtnText();
      } else {
        $(".dialog").toggle().css("width", "4rem").html("请输入1-500的整数");
        setTimeout(() => {
          $(".dialog").toggle();
        }, 1500);
        updateSubmitBtnText();
      }
    }

    $("#custom-price").val(customInputTemp);
  }
  /* ----- 用户ID输入检查 ----- */
  async function checkUnionId() {
    const regex = /^[0-9]*$/;
    userUnionId = $("#id-input").val();

    if (!regex.test(userUnionId)) {
      $(".warn").css("opacity", "1").html("请输入正确ID");
      userValid = false;
      return;
    }

    if (userUnionId === "") {
      $(".warn").css("opacity", "1").html("请先输入ID");
      userValid = false;
      return;
    }
    let data = await encryption({
      unionId: userUnionId,
    });
    $.get(
      config.baseUrl + "/user/union/search",
      data,
      function (resp) {
        if (resp.data.unionId) {
          nickName = resp.data.nickName;
          userId = resp.data.id;
          $(".warn")
            .css("opacity", "1")
            .html("账号昵称：" + nickName);
          $("#id-input").addClass("active");
          userValid = true;
          updateSubmitBtnText();
        } else {
          userId = "";
          $(".warn").css("opacity", "1").html("该ID不存在或还未完成注册");
          $("#id-input").removeClass("active");
          userValid = false;
        }
      },
      "json"
    );
  }
  /* ----- 用户协议勾选检测 ----- */
  function agreeXyCheck() {
    agreeXy = !agreeXy;
    $("#agreeXyCheck").toggleClass("checked");
    if (!agreeXy) {
      updateSubmitBtnText("请先勾选协议");
    } else {
      updateSubmitBtnText();
    }
  }
  /* ----- 检测是否可以提交 ----- */
  function checkSubmitStatus() {
    if (agreeXy) {
      if (userValid) {
        if (customPrice === "" && diamondPackageId === "-1") {
          $("#custom-price").val("");
          $("#custom-price").attr("placeholder", "自定义充值金额");
          updateSubmitBtnText("请先输入金额");
          return;
        } else {
          if (WeiXinIsTrue) {
            if (selectPayWay !== "5") {
              // 微信内置支付
              let newUrl = changeURLArg(window.location.href, "unionId", userUnionId);
              history.replaceState({}, "", newUrl);
              $(".weixinMask").toggle();
              return;
            }
          }
          $(".wating").toggle();
          if (qrFlag) {
            submit();
          }
          qrFlag = false;
        }
      } else {
        updateSubmitBtnText("请先输入正确ID");
      }
    } else {
      updateSubmitBtnText("请先勾选协议");
    }
  }
  /* ----- 更新提交按钮文字 ----- */
  function updateSubmitBtnText(text) {
    if (text !== undefined) {
      $("#submit-btn").html(text);
    } else {
      if (diamondPackageId === "-1" && customPrice === "") {
        $("#submit-btn").html("正在输入...");
      } else if (!agreeXy) {
        $("#submit-btn").html("请先勾选协议");
      } else {
        $("#submit-btn").html("确定支付" + money + "元");
      }
    }
  }
  /* ----- 改url ----- */
  function changeURLArg(url, arg, arg_val) {
    var pattern = arg + "=([^&]*)";
    var replaceText = arg + "=" + arg_val;
    if (url.match(pattern)) {
      var tmp = "/(" + arg + "=)([^&]*)/gi";
      tmp = url.replace(eval(tmp), replaceText);
      return tmp;
    } else {
      if (url.match("[?]")) {
        return url + "&" + replaceText;
      } else {
        return url + "?" + replaceText;
      }
    }
  }
  /* ----- 提交事件 ----- */
  async function submit() {
    $("#submit-btn").addClass("clicked");

    let data = await encryption({
      payType: Number(payType),
      payWay: selectPayWay,
      diamondPackageId: diamondPackageId,
      platform: "1",
      userId: userId,
      price: customPrice,
    });
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
        let confirmOrderData = {
          userId,
          orderNo,
        };
        localStorage.setItem("confirmOrderData", JSON.stringify(confirmOrderData));
        qrFlag = true;
        $("#submit-btn").removeClass("clicked");
        userValid = false;
        $(".wating").toggle();
        $("#id-input").val("");
        $(".cell ul").children().eq(0).addClass("choosed").siblings().removeClass("choosed");
        diamondPackageId = $(".cell ul").children().eq(0).attr("id");
        customPrice = $(".cell ul").children().eq(0).attr("val");
        window.location.href = resp.data.orderInfo;
        $(".warn").css("opacity", "0");
      },
      error: function (error) {
        $(".wating").toggle();
        qrFlag = true;
        $(".fail-network").html(`<p>${error.responseJSON.message}</p>`).toggle();
        setTimeout(() => {
          $(".fail-network").toggle();
          $("#submit-btn").toggleClass("clicked");
        }, 5000);
      },
    });
  }
  /* ----- 确认订单 ----- */
  async function confirmOrder() {
    let confirmOrderResult = await confirmOrderRequest();
    if (confirmOrderResult !== false) {
      switch (confirmOrderResult.data.payStatus) {
        // 1：未支付 2：已完成 3：已退款 4：已取消
        case 1:
          setTimeout(() => {
            confirmOrder();
          }, 1000);
          break;
        case 2:
          preventBack();
          $(".resMaskS").show();
          $(".resPriceValue").html(confirmOrderResult.data.payPrice.toFixed(2));
          $(".resMaskS").on("click", () => {
            localStorage.clear();
            $(".resMaskS").hide();
          });
          return;
        case 3:
          break;
        case 4:
          preventBack();
          $(".resMaskF").show();
          $(".resMaskF").on("click", () => {
            localStorage.clear();
            $(".resMaskF").hide();
          });
          return;
        default:
          break;
      }
    } else {
      setTimeout(() => {
        confirmOrder();
      }, 1000);
    }
  }
  /* ----- 确认订单的请求 ----- */
  function confirmOrderRequest() {
    let data = JSON.parse(localStorage.getItem("confirmOrderData"));
    return new Promise((relove) => {
      if (data) {
        $.get(
          config.baseUrl + "/tran/diamondRechargeOrder/queryOrder",
          data,
          function (resp) {
            relove(resp);
          },
          "json"
        );
      } else {
        relove(false);
      }
    });
  }
  /* ----- 阻止页面回退 ----- */
  function preventBack() {
    console.log("阻止回退执行了");
    history.pushState(null, null, document.URL);
    window.addEventListener("popstate", function () {
      history.pushState(null, null, document.URL);
    });
  }
});
