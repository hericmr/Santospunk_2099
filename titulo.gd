extends Sprite2D

# Posição final dentro da viewport
var posicao_final = Vector2(1120, 150)  # Defina a posição final onde o título vai parar
var duracao_movimento = 0.5  # Tempo em segundos para o movimento

func _ready():
	# Define a posição inicial fora da tela (à esquerda)
	position = Vector2(-10000, 150)  # Começa fora da viewport

	# Espera 8 segundos antes de iniciar o movimento
	await get_tree().create_timer(5.0).timeout

	# Inicia o movimento do título após a espera
	await mover_para(posicao_final, duracao_movimento)

# Função para mover o título para a posição final
func mover_para(destino: Vector2, duracao: float) -> void:
	var tempo_passado = 0.0
	var posicao_inicial = position

	while tempo_passado < duracao:
		var t = tempo_passado / duracao
		position = lerp(posicao_inicial, destino, t)  # Interpola a posição
		tempo_passado += get_process_delta_time()
		await get_tree().process_frame  # Espera até o próximo frame

	position = destino  # Garante que a posição final seja atingida
	await get_tree().create_timer(15.0).timeout
	get_tree().change_scene_to_file("res://Intro.tscn")
