// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";
import "./popup.css";
var xhr = new XMLHttpRequest();
xhr.open("GET", "http://homestead.test/test");
xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
		// WARNING! Might be evaluating an evil script!
		try {
			var data = JSON.parse(xhr.responseText);
			var title = document.getElementById('title');
			title.innerText =  data.ip_addresses;
			var max = data.plan_monthly_data / 1024 / 1024 /1024;
			var now = (data.data_counter / 1024 / 1024 / 1024).toFixed(2);
			c3.generate({
				bindto: "#gauge",
				data: {
					columns: [["已使用流量 " + now + " GB", now]],
					type: "gauge"
				},
				color: {
					pattern: ["#1ab394", "#BABABA"]
				},
				gauge: {
					max: max
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
};
xhr.send();
