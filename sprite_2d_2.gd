extends Sprite2D

# Referência ao Label que vai mostrar o texto
@onready var dialogo_label = $"../Dialogo"
@onready var nome_input = $"../NomeInput"  # Referência ao LineEdit para entrada do nome
@onready var som_player = $"../SomPlayer"  # Referência ao AudioStreamPlayer para o som do nome
@onready var som_ambience = $"../SomAmbience"  # Referência ao AudioStreamPlayer para o som ambiente
@onready var som_cidade = $"../Cidade"

# Posição final dentro da viewport
var posicao_final = Vector2(700, 850)  # Defina a posição final onde o personagem vai parar

func _ready():
	# Verifica se o Label, o LineEdit e os sons foram encontrados corretamente
	if dialogo_label == null:
		print("Erro: Label 'Dialogo' não encontrado.")
		return
	if nome_input == null:
		print("Erro: LineEdit 'NomeInput' não encontrado.")
		return
	if som_player == null:
		print("Erro: AudioStreamPlayer 'SomPlayer' não encontrado.")
		return
	if som_ambience == null:
		print("Erro: AudioStreamPlayer 'SomAmbience' não encontrado.")
		return

	# Toca o som ambiente desde o início
	som_ambience.play()
	# Define a posição inicial fora da tela
	position = Vector2(-100, 850)  # Posição inicial fora da viewport (à esquerda)

	# Conecta o sinal de submissão do texto ao método que lida com a entrada do nome
	nome_input.text_submitted.connect(_on_nome_input_submitted)

	# Move o personagem para dentro da tela
	await mover_para(posicao_final, 3.0)

	# Espera 3 segundos antes de falar
	await get_tree().create_timer(3.0).timeout
	falar("Olá forasteiro", 6)
	await get_tree().create_timer(6.0).timeout
	
	# Após falar, o personagem aumenta de tamanho 5 vezes, com intervalos de 0.5 segundos
	await aumentar_tamanho(0.2, 5)

	# Solicita o nome do usuário
	await get_tree().create_timer(0.5).timeout
	dialogo_label.text = "Quem é você?"
	await get_tree().create_timer(1.0).timeout
	nome_input.visible = true  # Torna o LineEdit visível
	nome_input.grab_focus()  # Foca no LineEdit para o usuário começar a digitar

# Função para mover o personagem para uma posição específica em um tempo determinado
func mover_para(destino: Vector2, duracao: float) -> void:
	var tempo_passado = 0.0
	var posicao_inicial = position

	while tempo_passado < duracao:
		var t = tempo_passado / duracao
		position = lerp(posicao_inicial, destino, t)
		tempo_passado += get_process_delta_time()
		await get_tree().process_frame  # Espera até o próximo frame

	position = destino  # Garante que a posição final seja alcançada

# Função chamada quando o usuário submete o texto no LineEdit
func _on_nome_input_submitted(text):
	var nome_usuario = text.strip_edges()  # Remove espaços
	if nome_usuario != "":
		await get_tree().create_timer(3.0).timeout
		dialogo_label.text = ("Heim?" + nome_usuario + "!?..")
		await get_tree().create_timer(1.0)
		dialogo_label.text = "Que nome idiota!"  # Mostra uma mensagem
		som_player.play()  # Executa o som "nome.wav"
		nome_input.visible = false  # Oculta o LineEdit após a entrada
		# Após o nome ser inserido, o personagem pode aumentar de tamanho novamente
		await get_tree().create_timer(4.0).timeout
		await aumentar_tamanho(0.4, 12)
	else:
		dialogo_label.text = "Digite um nome!"
		nome_input.grab_focus()  # Foca no LineEdit novamente para tentar de novo
		
	
	dialogo_label.text = "Bom... " + nome_usuario + "
	aqui estamos... 
	na cidade de Santos"
	som_cidade.play()
	await get_tree().create_timer(5.0).timeout
	som_ambience.stop()
	print("Tentando carregar cena Menu...")
	# Substitui change_scene por change_scene_to para carregar diretamente a cena preloaded
	get_tree().change_scene_to_file("res://Menu.tscn")



# Função para exibir o texto por um tempo definido
func falar(texto: String, duracao: float) -> void:
	if dialogo_label != null:
		dialogo_label.text = texto  # Define o texto do Label
		await get_tree().create_timer(duracao).timeout  # Espera pelo tempo definido
		dialogo_label.text = ""  # Limpa o texto após o tempo

# Função para aumentar o tamanho do Sprite
func aumentar_tamanho(fator: float, repeticoes: int) -> void:
	for i in range(repeticoes):
		scale *= (1 + fator)  # Aumenta o tamanho pelo fator definido
		await get_tree().create_timer(0.5).timeout  # Espera 0.5 segundos entre cada aumento
