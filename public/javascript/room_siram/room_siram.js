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

		// firstChild.append(`
		//     <div class="custom-table-first-row-column">
		//         <div>
		//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		//                 <path d="M8.63633 2.5C7.42268 2.5 6.23628 2.85989 5.22717 3.53416C4.21806 4.20843 3.43155 5.16679 2.9671 6.28806C2.50266 7.40932 2.38114 8.64314 2.61791 9.83347C2.85468 11.0238 3.43911 12.1172 4.29729 12.9754C5.15547 13.8335 6.24886 14.418 7.43919 14.6547C8.62952 14.8915 9.86334 14.77 10.9846 14.3056C12.1059 13.8411 13.0642 13.0546 13.7385 12.0455C14.4128 11.0364 14.7727 9.84998 14.7727 8.63633C14.7726 7.0089 14.126 5.44817 12.9753 4.2974C11.8245 3.14664 10.2638 2.5001 8.63633 2.5Z" stroke="#8C98A4" stroke-width="2" stroke-miterlimit="10"/>
		//                 <path d="M13.2144 13.2145L17.4999 17.5" stroke="#8C98A4" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
		//             </svg>
		//             <input type="search" class="form-control form-control-sm custom-search-input" placeholder="Search" aria-controls="customize-table">
		//         </div>
		//     </div>
		//     <div class="custom-table-first-row-column">
		//         <section class="menu-option" style="background-color: #377DFF;">
		//             <a id="tambah_button" style="color: white; cursor: pointer;"
		//                 data-toggle="modal" data-target="#create_modal">
		//                     <span style="color: #ffffff;">+ Tambah Pendidikan</span>
		//             </a>
		//         </section>
		//         <section id="export-pdf-button" class="menu-option">
		//             <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		//                 <path
		//                     d="M16.875 8.75V16.25C16.875 16.5815 16.7433 16.8995 16.5089 17.1339C16.2745 17.3683 15.9565 17.5 15.625 17.5H4.375C4.04348 17.5 3.72554 17.3683 3.49112 17.1339C3.2567 16.8995 3.125 16.5815 3.125 16.25V8.75C3.125 8.41848 3.2567 8.10054 3.49112 7.86612C3.72554 7.6317 4.04348 7.5 4.375 7.5H6.25C6.41576 7.5 6.57473 7.56585 6.69194 7.68306C6.80915 7.80027 6.875 7.95924 6.875 8.125C6.875 8.29076 6.80915 8.44974 6.69194 8.56695C6.57473 8.68416 6.41576 8.75 6.25 8.75H4.375V16.25H15.625V8.75H13.75C13.5842 8.75 13.4253 8.68416 13.3081 8.56695C13.1908 8.44974 13.125 8.29076 13.125 8.125C13.125 7.95924 13.1908 7.80027 13.3081 7.68306C13.4253 7.56585 13.5842 7.5 13.75 7.5H15.625C15.9565 7.5 16.2745 7.6317 16.5089 7.86612C16.7433 8.10054 16.875 8.41848 16.875 8.75ZM7.31719 5.44219L9.375 3.3836V10.625C9.375 10.7908 9.44085 10.9497 9.55806 11.0669C9.67527 11.1842 9.83424 11.25 10 11.25C10.1658 11.25 10.3247 11.1842 10.4419 11.0669C10.5592 10.9497 10.625 10.7908 10.625 10.625V3.3836L12.6828 5.44219C12.8001 5.55947 12.9591 5.62535 13.125 5.62535C13.2909 5.62535 13.4499 5.55947 13.5672 5.44219C13.6845 5.32492 13.7503 5.16586 13.7503 5C13.7503 4.83415 13.6845 4.67509 13.5672 4.55782L10.4422 1.43282C10.3841 1.37471 10.3152 1.32861 10.2393 1.29715C10.1635 1.2657 10.0821 1.24951 10 1.24951C9.91787 1.24951 9.83654 1.2657 9.76066 1.29715C9.68479 1.32861 9.61586 1.37471 9.55781 1.43282L6.43281 4.55782C6.31554 4.67509 6.24965 4.83415 6.24965 5C6.24965 5.16586 6.31554 5.32492 6.43281 5.44219C6.55009 5.55947 6.70915 5.62535 6.875 5.62535C7.04085 5.62535 7.19991 5.55947 7.31719 5.44219Z"
		//                     fill="#377DFF" />
		//             </svg>&nbsp;
		//             <span>Export</span>
		//         </section>

		//     </div>
		// `)

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

		// $('#export-pdf-button').on('click', function() {
		//     let dataTableData = api.rows().data().toArray();
		//     let titlePdf = "Pendidikan";

		//     let headers = api.columns().header().toArray().map((header, index) => {
		//         if (index < api.columns().header().length - 1) {
		//             return {
		//                 text: header.innerText,
		//                 style: 'tableHeader'
		//             };
		//         }
		//         return null;
		//     }).filter(header => header !== null);

		//     let styles = {
		//         tableHeader: {
		//             bold: true,
		//             fontSize: 11,
		//             color: 'black',
		//             fillColor: '#d3d3d3',
		//             alignment: 'center'
		//         },
		//         tableContent: {
		//             fontSize: 10,
		//             alignment: 'center'
		//         },
		//         header: {
		//             fontSize: 18,
		//             bold: true,
		//             alignment: 'center',
		//             margin: [0, 0, 0, 10]
		//         },
		//     };

		//     let dataRows = dataTableData.map(row => {
		//         return row.slice(0, row.length - 1).map(cell => {
		//             return {
		//                 text: cell,
		//                 style: 'tableContent'
		//             };
		//         });
		//     });

		//     let docDefinition = {
		//         content: [{
		//                 text: titlePdf,
		//                 style: 'header'
		//             },
		//             {
		//                 table: {
		//                     widths: ['5%', '50%', '45%'],
		//                     headerRows: 1,
		//                     body: [
		//                         headers,
		//                         ...dataRows
		//                     ]
		//                 }
		//             }
		//         ],
		//         styles: styles
		//     };
		//     pdfMake.createPdf(docDefinition).download('pendidikan.pdf');
		// });
	},
})

if (backButton) {
	const backButton = document.getElementById("back_button")
	backButton.addEventListener("click", () => {
		try {
			window.location.href = `${window.location.origin}/dashboard`
		} catch (error) {
			console.log("- Error Back Button : ", error)
		}
	})
}
