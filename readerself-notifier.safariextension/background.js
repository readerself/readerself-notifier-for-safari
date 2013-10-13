var url_settings = safari.extension.settings.url;
var icon = safari.extension.toolbarItems[0];
var refresh_on_home = false;

function setBrowserAction(title, badgeText, colorCode) {
	icon.toolTip = title;
	icon.badge = badgeText;
	icon.enabled = true;
}

function changeHandler() {
	url_settings = safari.extension.settings.url;
	_update();
}
function navigateHandler(event){
	var url_target = event.target.url;
	if(url_settings.slice(-1) === '/') {
		url_settings = url_settings.slice(0, -1);
	}
	if(url_target.indexOf(url_settings + '/home') != -1) {
		if(refresh_on_home) {
			clearInterval(refresh_on_home);
		}
		refresh_on_home = setInterval('_update()', 5000);
	}
}
function _update() {
	if(url_settings.slice(-1) === '/') {
		url_settings = url_settings.slice(0, -1);
	}
	$.ajax({
		async: true,
		cache: false,
		dataType: 'json',
		error: function(jqXHR, textStatus, errorThrown) {
			title = 'URL error';
			badgeText = '!';
			colorCode = 'orange'
			setBrowserAction(title, badgeText, colorCode);
		},
		success: function(data, textStatus, jqXHR) {
			if(data.logged) {
				if(data.unread > 0) {
					title = 'You have ' + data.unread + ' unread items';
					colorCode = 'green'
				} else {
					title = 'You have no unread items';
					colorCode = 'gray'
				}
				badgeText = data.unread;
			} else {
				title = 'You are not connected';
				badgeText = '!';
				colorCode = 'yellow'
			}
			setBrowserAction(title, badgeText, colorCode);
		},
		type: 'GET',
		url: url_settings + '/extension/background'
	});
}

safari.application.addEventListener('command', function (e) {
	if(e.command === 'open') {
		var win = safari.application.activeBrowserWindow;
		if(url_settings != '') {
			win.openTab().url = url_settings;
		}
	}
});

safari.extension.settings.addEventListener('change', changeHandler, false);
safari.application.addEventListener('navigate', navigateHandler, true);

setInterval(_update, 600000);

_update();
