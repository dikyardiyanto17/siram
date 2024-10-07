$("#customize-table").DataTable({
	language: {
		infoFiltered: "(_MAX_ total entries)",
		paginate: {
			next: ">",
			previous: "<",
		},
	},
	// columns: [{ width: "20%" }, null, null, null, null, null, null, null],
	paging: true,
	pageLength: 10,
	lengthChange: true,
	searching: true,
	ordering: true,
	info: true,
	autoWidth: false,
	responsive: true,
	ordering: false,
	initComplete: function () {
		let api = this.api()
		const searchContainer = $("#customize-table_filter")
		searchContainer.html("")

		searchContainer.append(
			`
            `
		)

		const wrapper = $("#customize-table_wrapper")
		const firstChild = wrapper.children().first()
		firstChild.html("")
		firstChild.append(`
            <div class="custom-table-first-row-column">
                <div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.331 13.4266C10.938 14.5396 9.17166 15.077 7.3948 14.9284C5.61794 14.7798 3.96542 13.9565 2.77666 12.6275C1.58789 11.2985 0.953114 9.56484 1.0027 7.78246C1.05229 6.00009 1.78247 4.30435 3.04329 3.04354C4.30411 1.78272 5.99984 1.05253 7.78222 1.00295C9.56459 0.953358 11.2983 1.58813 12.6273 2.7769C13.9562 3.96567 14.7796 5.61818 14.9282 7.39504C15.0768 9.1719 14.5394 10.9382 13.4263 12.3312L18.7544 17.6582C18.8305 17.7292 18.8916 17.8147 18.9339 17.9098C18.9763 18.0049 18.9991 18.1075 19.0009 18.2115C19.0027 18.3156 18.9836 18.419 18.9446 18.5155C18.9056 18.612 18.8476 18.6997 18.774 18.7732C18.7004 18.8468 18.6128 18.9049 18.5163 18.9438C18.4198 18.9828 18.3164 19.002 18.2123 19.0001C18.1083 18.9983 18.0056 18.9755 17.9106 18.9331C17.8155 18.8908 17.7299 18.8297 17.659 18.7536L12.331 13.4266ZM4.14159 11.8125C3.38315 11.054 2.86658 10.0876 2.65718 9.0356C2.44778 7.98358 2.55494 6.8931 2.96512 5.90196C3.3753 4.91083 4.07009 4.06353 4.96168 3.46716C5.85327 2.87078 6.90164 2.55209 7.9743 2.55137C9.04696 2.55065 10.0958 2.86793 10.9881 3.4631C11.8805 4.05828 12.5765 4.90464 12.988 5.89522C13.3995 6.8858 13.5081 7.97614 13.3001 9.02844C13.0922 10.0807 12.5769 11.0478 11.8195 11.8073L11.8143 11.8125L11.8091 11.8166C10.7914 12.832 9.41218 13.4019 7.97451 13.4012C6.53684 13.4004 5.15826 12.829 4.14159 11.8125Z" fill="#2E3238"/>
                    </svg>
                    <input type="search" class="form-control form-control-sm custom-search-input" placeholder="Search" aria-controls="customize-table">
                </div>
            </div>
            <div class="custom-table-first-row-column">
            </div>
        `)

		const pagination = $("#customize-table_paginate")

		const initialInfo = $("#customize-table_info")
		const wrapperLastRowElement = document.getElementById("customize-table_wrapper")
		const showEntriesElement = wrapperLastRowElement.lastElementChild.firstElementChild
		const paginationElement = wrapperLastRowElement.lastElementChild.lastElementChild
		showEntriesElement.className = "col-4"
		paginationElement.className = "col-4"

		const lastChild = wrapper.children().last()
		// const initialPagination = lastChild.children().last().clone().removeClass('').addClass('col-4');
		const showEntriesFunction =
			'<label style="display: flex; align-items: center; height: 100%;">Show&nbsp;<select name="customize-table_length" aria-controls="customize-table" class="">' +
			'<option value="10">10</option>' +
			'<option value="25">25</option>' +
			'<option value="50">50</option>' +
			'<option value="100">100</option>' +
			"</select>&nbsp;entries</label>"
		const footer = `
            <div class="col-4">
                ${showEntriesFunction}
            </div>
        `

		lastChild.append(footer)

		const lengthContainer = $("#customize-table_length")

		$('select[name="customize-table_length"]').on("change", function () {
			api.page.len(this.value).draw()
		})

		$(".custom-search-input").on("keyup change clear", function () {
			if (api.search() !== this.value) {
				api.search(this.value).draw()
			}
		})
	},
})



if (backButton) {
	const backButton = document.getElementById("back_button")
	backButton.addEventListener("click", () => {
		try {
			window.location.href = `${window.location.origin}/meeting`
		} catch (error) {
			console.log("- Error Back Button : ", error)
		}
	})
}
