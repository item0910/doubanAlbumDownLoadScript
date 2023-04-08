// ==UserScript==
// @name         Batch Download for Douban Photo Albums
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This script enables batch download of original images for Douban's movie album (movie.douban.com)
// @author       @Item
// @match        *movie.douban.com/*/photos*
// @match        *www.douban.com/photos/album/*
// @grant        none
// @icon         https://s2.loli.net/2023/04/08/aVOg3ToncG8RkNt.png
// @compatible   chrome
// @compatible   firefox
// @compatible   opera
// @compatible   safari
// ==/UserScript==


(async function () {
	'use strict';

	var config_;

	const batch_download = async function () {
		let $img_list = document.querySelectorAll(config_.$img_list_selector);
		if ($img_list.length == 0) {
			setTimeout(batch_download, 1000);
			return;
		}

		for (let i = 0; i < $img_list.length; i++) {
			let $img = $img_list[i];
			let download_$a = document.createElement("a");
			download_$a.href = $img.src.replace(config_.photo_src_regex, config_.photo_src_replacement);
			download_$a.download = $img.parentNode.href.replace(config_.photo_id_regex, config_.photo_id_replacement);

			await new Promise(resolve => {
				fetch(download_$a.href)
					.then(res => res.blob())
					.then(blob => {
						let blob_url = window.URL.createObjectURL(blob);
						download_$a.href = blob_url;
						download_$a.click();
						window.URL.revokeObjectURL(blob_url);
						setTimeout(resolve, 500);
					});
			});
		}
	}

	const init = function () {
		const domain_regex = /:\/\/(?<domain>[\w\.]+)/;
		const config_map = {
			"movie.douban.com": {
				"batch_download_$button_container_selector": ".opt-bar-line",
				"batch_download_$button_class": "fright",
				"$img_list_selector": "div.article ul li img",
				"photo_id_regex": /.+photo\/(?<id>\d+).*/,
				"photo_id_replacement": "$<id>",
				"photo_src_regex": /(?<prefix>.+photo\/)\w+(?<suffix>\/public.+)\..*/,
				"photo_src_replacement": "$<prefix>raw$<suffix>",
			},
			"www.douban.com": {
				"batch_download_$button_container_selector": ".photitle",
				"batch_download_$button_class": "fright",
				"$img_list_selector": "div.photo_wrap a img",
				"photo_id_regex": /.+photo\/(?<id>\d+).*/,
				"photo_id_replacement": "$<id>",
				"photo_src_regex": /(?<prefix>.+photo\/)\w+(?<suffix>\/public.+)\..*/,
				"photo_src_replacement": "$<prefix>raw$<suffix>",
			},
		};

		let domain = domain_regex.exec(document.location.origin).groups.domain;
		config_ = config_map[domain];

		let batch_download_$button = document.createElement("button");
		batch_download_$button.textContent = "下载本页图片";
		batch_download_$button.style.fontWeight = "bolder";
		batch_download_$button.classList.add(config_.batch_download_$button_class);
		batch_download_$button.onclick = batch_download;
		document.querySelector(config_.batch_download_$button_container_selector).appendChild(batch_download_$button);
	}

	await init();
})();

