class Ferramentas {
	static requisitarConteudo(conteudo) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: `conteudos/${conteudo}.html`,
				method: 'GET',
				success: function (response) {
					resolve(response)
				},
				error: function (response) {
					console.log(response)
					reject('Não foi possivel completar a requisição \n ' + response)
				}

			})
		})
	}

	static inputKeyboard(key) {
		const calculadoraTeclas = [
			'+',
			'-',
			'x',
			'*',
			'/',
			'(',
			')',
			'Enter',
			'c',
			'Backspace',
			',',
			'.'
		]
		if (!isNaN(parseFloat(key)) || calculadoraTeclas.includes(key)) {
			if($('#calculadora').length > 0) return 'Calculadora'
		}

		return null
	}

	static rolarPagina(positionTop) {
		$('html, body').animate({ scrollTop: positionTop }, 1)
	}
}

class Db {
	setData(name, dados) {
		localStorage.setItem(name, JSON.stringify(dados))
	}

	setTempData(dados) {
		sessionStorage.setItem('tempData', JSON.stringify(dados))
	}

	getData(name) {
		return JSON.parse(localStorage.getItem(name))
	}

	getAll() {
		const todosDados = {}
		for (let i = 0; i < localStorage.length; i++) {
			const chave = localStorage.key(i)
			const dados = localStorage.getItem(chave)

			try {
				todosDados[chave] = JSON.parse(dados)
			} catch (e) {
				todosDados[chave] = dados
			}
		}

		return todosDados
	}

	getTempData() {
		return JSON.parse(sessionStorage.getItem('tempData'))
	}

	removeData(name) {
		localStorage.removeItem(name)
	}

	removeAll() {
		localStorage.clear()
	}

}

class Lista {
	#db
	#infos

	constructor(db) {
		this.#db = db
		this.#infos = this.#db.getAll()
	}

	updateList(){
		this.#infos = this.#db.getAll()
	}

	listAll() {
		let conteudo = ''

		for (let key in this.#infos) {
			let info = this.#infos[key]

			let element = `<tr class="tr" id='TR${key.replace(' ', '')}'>

							<td class="td">${key}</td>
							<td class="td">${info.total}</td>
							<td class="td">${info.media}</td>
							<td class="td">${info.maior}</td>
							<td class="td">${info.menor}</td>

							<td class="td"><button class='btn btn-sm btn-danger' onclick='lista.deleteKey("${key}")'>
							<i class="fa-solid fa-trash"></i>
							</button></td>
						</tr>`
			conteudo = conteudo + element
		}

		if (conteudo.length === 0) {
			conteudo = '<tr><td colspan="6">Nenhum item encontrado</td></tr>'
		}

		$('#lista-achados').html(conteudo)
	}

	searchItem() {
		let query = $('#buscar').val()
		let conteudo = ''
		const infos = this.#db.getAll()
		query = query.toLowerCase()

		let keysStart = []
		let keysContains = []

		for (let key in this.#infos) {
			let lowerkey = key.toLowerCase()

			if (lowerkey.startsWith(query)) keysStart.push(key)
			else if (lowerkey.includes(query)) keysContains.push(key)
		}

		const sortKeys = [...keysStart, ...keysContains]

		if (sortKeys.length > 0) {
			for (let key of sortKeys) {
				let info = this.#infos[key]
				let element = `<tr id='TR${key.replace(' ', '')}'>
							<td class="td">${key}</td>
							<td class="td">${info.total}</td>
							<td class="td">${info.media}</td>
							<td class="td">${info.maior}</td>
							<td class="td">${info.menor}</td>
							<td class="td">
							<button class='btn btn-danger' onclick='lista.deleteKey("${key}")'>
							<i class="fa-solid fa-trash"></i></button>
							</td>
						</tr>`
				conteudo += element
			}
		} else {
			conteudo = '<tr><td colspan="6">Nenhum item encontrado</td></tr>'
		}

		$('#lista-achados').html(conteudo)
	}

	deleteKey(key) {
		let idTr = `#TR${key.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '\\$&')}`
		console.log(idTr)
		
		db.removeData(key)
		$(idTr).remove()

	}
}

class Calculadora {
	#calculo
	#allowChars
	#maior
	#menor
	#db

	constructor(db) {
		this.db = db
		this.#calculo = ''
		this.#allowChars = ['+', '-', 'x', '*', '/', '(', ')', ',', '.']
		for (let i = 0; i <= 9; i++) {
			this.#allowChars.push(String(i))
		}

	}

	async exibirCalculadora() {
		const resposta = await Ferramentas.requisitarConteudo('calculadora')
		return resposta
	}

	#atualizarVisor() {
		if (typeof (this.#calculo) === 'string') {
			this.#calculo = this.#calculo.replaceAll(' ', '')
		}

		if (this.#calculo === '') {
			$('#visor').val('0')
		} else if (typeof (this.#calculo) === 'object') {
			let total = this.#getCalcValue('total')
			let media = this.#getCalcValue('media')
			if (String(total[1]).charAt(1) === '' && String(total[1]).charAt(0) !== '0') total[1] = '0' + total[1]
			if (String(media[1]).charAt(1) === '' && String(media[1]).charAt(0) !== '0') media[1] = '0' + media[1]
			let valores = `T=${total[0]}:${total[1]} Me=${media[0]}:${media[1]}`
			$('#visor').val(valores)
		} else {
			this.#calculo = this.#calculo.split('').filter(c => this.#allowChars.includes(c)).join('')

			$('#visor').val(this.#calculo)
		}

		$('#visor').css('height', 'auto')
		$('#visor').css('height', $('#visor')[0].scrollHeight + 'px')
	}

	#getCalcValue(indice) {
		return this.#calculo.find(item => item.indice === indice).value
	}

	addNumber(number) {
		let numero = number.toString()
		this.#calculo += numero
		this.#atualizarVisor()
	}

	inputVisor() {
		if (this.#calculo === '') {
			this.#calculo = $('#visor').val().slice(-1)
			$('#visor').val('')
		} else {
			this.#calculo = $('#visor').val()
		}

		this.#atualizarVisor()
	}

	removerCaracter() {
		this.#calculo = this.#calculo.toString()
		this.#calculo = this.#calculo.slice(0, -1)
		this.#atualizarVisor()
	}

	clearAll() {
		this.#calculo = ''
		this.#atualizarVisor()
	}

	calcular() {
		let tipoCalculadora = $('input[name="tipo"]:checked').val()
		let tipoCalculo = $('input[name="tipoTempo"]:checked').val()

		//console.log(tipoCalculadora)
		//console.log(tipoCalculo)

		if (this.#calculo === '') this.#calculo = '0'

		this.#calcularTemp(this.#calculo)
		this.#calculo = DOMPurify.sanitize(this.#calculo.split('').filter(c => this.#allowChars.includes(c)).join(''))
		//this.#calculo = eval(this.#calculo.replaceAll(',', '.').replaceAll(' ', '').replaceAll('x', '*')).toString()
		this.#calculo = this.#calcularTemp(this.#calculo.toString())

		this.#atualizarVisor()
		if (typeof (this.#calculo === 'object')) this.#escreverRespostaTempo(this.#calculo)
	}

	#escreverRespostaTempo(object = [0, 0]) { //total and media
		const divRes = document.getElementById('respostas')
		let total = this.#getCalcValue('total')
		let media = this.#getCalcValue('media')

		if (String(total[1]).charAt(1) === '' && String(total[1]).charAt(0) !== '0') total[1] = '0' + total[1]
		if (String(media[1]).charAt(1) === '' && String(media[1]).charAt(0) !== '0') media[1] = '0' + media[1]

		let valores = `<div class='col-5 p-0'>Total = ${total[0]}:${total[1]} 
		<br/> Média = ${media[0]}:${media[1]} 
		<br/> Maior = ${this.#maior} 
		<br/> Menor = ${this.#menor}</div>
		<br/> <div class="col-7 ps-2"> 
		<div id='alert-success' class="alert alert-success text-center d-none" role="alert">
					Salvo com sucesso
		</div>
		<div id='alert-error' class="alert alert-danger text-center d-none" role="alert">
					Erro ao salvar!
		</div>
		<input id='nome-calculo' type="text" placeholder="Digite um nome" class='form-control'> <button onclick='calculadora.salvar()' class='btn btn-primary w-100 mt-2'>Salvar</button>
		</div>`

		let dados = {
			total: `${total[0]}:${total[1]}`,
			media: `${media[0]}:${media[1]}`,
			maior: `${this.#maior}`,
			menor: `${this.#menor}`
		}

		//armazenar os dados
		db.setTempData(dados)

		$(divRes).html(valores)
		Ferramentas.rolarPagina(divRes.getBoundingClientRect().y + divRes.getBoundingClientRect().height)
		this.#calculo = ''
	}

	salvar() {
		$('#nome-calculo').removeClass('bg-danger placeholder-light text-light')
		$('#alert-success, #alert-error').removeClass('d-none d-block')
		$('#alert-error').addClass('d-none')
		$('#alert-success').addClass('d-block')
		let nome = $('#nome-calculo').val()
		if (nome == undefined || nome == null || nome === '') {
			$('#nome-calculo').addClass('bg-danger placeholder-light text-light').focus()
			$('#alert-error, #alert-success').removeClass('d-none d-block')
			$('#alert-error').addClass('d-block')
			$('#alert-success').addClass('d-none')
			return
		}
		db.setData(nome, db.getTempData())
		$('#nome-calculo').val('')
	}

	#calcularTemp(numero, converter = true) {
		const allowSim = ['+', '-', '/', 'x', '*', '**', '%']
		let conta = numero.replaceAll(',', '.').replaceAll('x', '*')
		let simbolos = conta.split('').filter(c => allowSim.includes(c))
		let numeros = conta.split(/[\+\-\/\x\*\**\%]/)
		let quantidade = numeros.length

		let arrFloat = numeros.map(n => parseFloat(n))
		this.#maior = Math.max(...arrFloat)
		this.#menor = Math.min(...arrFloat)
		this.#maior = this.#insertCaracter(this.#maior, 1, ':00')
		this.#menor = this.#insertCaracter(this.#menor, 1, ':00')
		this.#maior = this.#insertCaracter(this.#maior, 3, '0')
		this.#menor = this.#insertCaracter(this.#menor, 3, '0')
		this.#maior = String(this.#maior).replace('.', ':')
		this.#menor = String(this.#menor).replace('.', ':')


		//evitar casas decimais a mais
		numeros = this.#preventDecimals(numeros)
		numeros = this.#intToFloat(numeros, 2)
		numeros = this.#preventNullNumbers(numeros)

		//corrigir numero de simbolos
		simbolos = this.#countSimbols(simbolos, numeros)

		numeros = numeros.map(value => value.split('.'))

		let convDec = this.#preventNullNumbers(this.#convertMinutesToDecimal(numeros, simbolos))

		//juntar tudo e fazer as operacoes
		conta = eval(String(convDec.join('')))
		let total = this.#decimalToHours(conta, 2)
		let media = this.#decimalToHours(conta / quantidade, 2)

		return [
			{ indice: 'total', value: total },
			{ indice: 'media', value: media }]
	}

	#insertCaracter(value, position, replace) {
		if (String(value).charAt(position) === '') return value + replace

		return value
	}

	#convertMinutesToDecimal(numbers, simbols) {
		let numeros = numbers
		let simbolos = simbols
		let convDec = []
		numeros = numeros.map((arr, index) => {
			let pInt = parseInt(arr[0])
			let decInt = arr[1]
			if (arr[1].charAt(0) !== '0' && arr[1].charAt(1) === "") decInt *= 10
			decInt = parseInt(decInt)

			decInt = decInt / 60

			arr = Math.floor((pInt + decInt) * 100) / 100
			convDec.push(arr)
			if (index < simbolos.length) convDec.push(simbolos[index])
		})

		return convDec
	}

	#preventDecimals(arr) {
		let newArr = arr.map(value => {
			let primeiraOcorrencia = false

			let novoValor = value.split('').map(char => {
				if (char == '.' && !primeiraOcorrencia) {
					primeiraOcorrencia = true
					return char

				} else if (char == '.') return ''

				return char

			}).join('')

			return novoValor
		})

		return newArr
	}

	#preventNullNumbers(numbers) {
		numbers = numbers.filter(value => value != '')

		return numbers
	}

	#intToFloat(numeros, length = 2) {
		numeros = numeros.map(value => {
			let num = parseFloat(value)
			if (num - Math.floor(num) === 0) return String(parseFloat(num).toFixed(length))
			return String(num)
		})

		return numeros
	}

	#countSimbols(simbolos, numberList) {
		simbolos = simbolos.map((value, index) => {
			if (index < numberList.length - 1) { return value }
			else return ''
		})

		return simbolos
	}

	inputKeyboard(key) {
		if (typeof (key) === 'string') {
			switch (key) {
				case 'Enter':
					this.calcular()
					break

				case 'c':
					this.clearAll()
					break

				case 'Backspace':
					this.removerCaracter()
					break

				default:
					this.addNumber(key)
			}
		}
	}

	#decimalToHours(number, length = 0) {
		let hora = Math.floor(number)
		let minutos = 6 * parseInt(String(number).split('.')[1])

		if (length > 0) {
			minutos = parseInt(String(minutos).slice(0, length))
		}

		if (isNaN(minutos)) minutos = '00'

		return [hora, minutos]
	}

}

let db = new Db()
let calculadora = new Calculadora(db)
let lista = new Lista(db)

$(document).ready(async function () {
	let conteudo = await calculadora.exibirCalculadora()
	$('#conteudo').html(conteudo)
	inputKeyboard()
})

function acaoCalculadora(metodo, ...args) {
	if (typeof calculadora[metodo] === 'function') {
		calculadora[metodo](...args)
	} else {
		console.error(`O metodo "${metodo}" nao existe!`)
	}
}

function inputKeyboard() {
	let focado = false

	$('#visor').on('focusin', function () {
		focado = true
	})

	$('#visor').on('focusout', function () {
		focado = false
	})

	$(document).on('keydown', function (event) {
		let classe = null
		classe = !focado ? classe = Ferramentas.inputKeyboard(event.key) : null

		switch (classe) {
			case 'Calculadora': calculadora.inputKeyboard(event.key)
				break
		}
	})
}

async function trocarPagina(src) {
	const loadGif = "<a class='text-center' href='https://commons.wikimedia.org/wiki/File:Loading_2.gif'><img src='images/Loading.gif'><br/>Author: KopiteCowboy</a>"
	$('#conteudo').html(loadGif)
	let conteudo = await Ferramentas.requisitarConteudo(src)
	$('#conteudo').html(conteudo)
}

function alterarElemento(element, text) {
	$(element).text(text)
}

function debug() { }
