import "../vendor/css/bootstrap.css";
import "../vendor/css/animate.css";
import "../vendor/css/style.css";
import "../vendor/font-awesome/css/font-awesome.css";
import "./popup.css";
import "../vendor/js/bootstrap";
import "../vendor/js/Particleground";
import moment from "moment";
import guideTmpl from "../template/guide.art";
import indexTmpl from "../template/index.art";

const loadingTmpl = `
<div class="sk-spinner sk-spinner-wave">
    <div class="sk-rect1"></div>
    <div class="sk-rect2"></div>
    <div class="sk-rect3"></div>
    <div class="sk-rect4"></div>
    <div class="sk-rect5"></div>
</div>  
`;

let indexShow = false;
let guideShow = false;

function saveKey(veid, key, cb) {
  if (!veid) {
    const err = new Error("请输入veid");
    err.key = "veid";
    throw err;
  }
  if (!key) {
    const err = new Error("请输入key");
    err.key = "key";
    throw err;
  }
  chrome.storage.sync.set({ veid, userKey: key }, function() {
    if (cb) cb(veid, key);
  });
}

function showError(el, msg) {
  if (el.parent().is(".has-error")) return;
  el.parent()
    .addClass("has-error")
    .append('<div class="help-block">' + msg + "</div>");
}

function hideError(el) {
  if (el.parent().is(".has-error")) {
    el.parent()
      .removeClass("has-error")
      .find(".help-block")
      .remove();
  }
}

function render(dom) {
  return $("body")
    .empty()
    .append(dom);
}

function cacuPeriod(date) {
  console.log(date);
  const month = date.getMonth();
  const day = date.getDate();
  date.setDate(0);
  const oneMonth = date.getDate() + 1;
  const percent = (oneMonth - (day - new Date().getDate())) / oneMonth;
  return (percent * 100).toFixed(0);
}

function cloneDate(date) {
  return new Date(date.toDateString());
}

$(function() {
  render(loadingTmpl);
  chrome.storage.sync.get(["veid", "userKey"], function(result) {
    if (result.userKey && result.veid) {
      showIndex(result.veid, result.userKey);
    } else {
      showGuide();
    }
  });
});

function showGuide() {
  render(guideTmpl()).addClass("has-bg");
  if (guideShow) {
    return;
  }
  $("body").particleground({
    dotColor: "#E8DFE8",
    lineColor: "#133b88"
  });
  $("body").on("click", ".submit-btn", function() {
    try {
      saveKey($("#veid").val(), $("#key").val(), function(veid, key) {
        showIndex(veid, key);
        $("body").removeClass("has-bg");
      });
    } catch (e) {
      showError($("#" + e.key), e.message);
    }
  });
  $("body").on("input", "#key", function() {
    hideError($("#key"));
  });
  guideShow = true;
}

function showIndex(veid, key) {
  fetchData(veid, key, function(res) {
    let data = {
      ip_address: res.ip_addresses[0]
    };
    const refresh = new Date(res.data_next_reset * 1000);
    refresh.setDate(refresh.getDate() + 1);
    moment.locale("zh-CN");
    const percent = cacuPeriod(cloneDate(refresh));
    console.log(percent);
    data.periodPercent = percent + "%";
    if (refresh.getDate() - new Date().getDate() < 7) {
      data.refresh = moment(refresh).fromNow();
    } else {
      data.refresh = moment(refresh).format("YYYY年MM月DD日");
    }
    const max = res.plan_monthly_data / 1024 / 1024 / 1024;
    const now = (res.data_counter / 1024 / 1024 / 1024).toFixed(2);
    const dataPer = (now / max).toFixed(2);
    data.data = {
      now,
      max
    };
    render(indexTmpl(data));
    drawLayer03Right($("#arc")[0], "#238681", dataPer);
    if (indexShow) return;
    $("body").on("click", "#logout", function() {
      chrome.storage.sync.clear();
      showGuide();
    });
    indexShow = true;
  });
}

function drawLayer03Right(canvasObj, colorValue, rate) {
  var ctx = canvasObj.getContext("2d");
  var circle = {
    x: 65,
    y: 80,
    r: 60
  };
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
  ctx.lineWidth = 9;
  ctx.strokeStyle = "#e0f2f1";
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(
    circle.x,
    circle.y,
    circle.r,
    1.5 * Math.PI,
    (1.5 + rate * 2) * Math.PI
  );
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.strokeStyle = colorValue;
  ctx.stroke();
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.font = "20px Calibri";
  ctx.fillText(rate * 100 + "%", circle.x - 15, circle.y + 10);
}

function fetchData(veid, key, cb) {
  $.get(
    ENDPOINT + "test?veid=" + veid + "&pkey=" + key,
    function(res) {
      cb(res);
    }
  );
}
