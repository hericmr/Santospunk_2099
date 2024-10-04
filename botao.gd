extends Sprite2D

var cor_original: Color

# Função chamada quando o nó entra na árvore de cena pela primeira vez
func _ready() -> void:
	# Define o Sprite como invisível inicialmente
	visible = false
	
	# Espera 10 segundos antes de torná-lo visível
	await get_tree().create_timer(10.0).timeout
	
	# Torna o Sprite visível
	visible = true
	cor_original = modulate  # Armazena a cor original do botão

	# Inicia o efeito de destaque
	await destacar_botao()

# Função para destacar o botão com efeitos
func destacar_botao() -> void:
	# Efeito de pulsação cíclica
	while visible:
		# Alterna a cor
		modulate = Color(1, 0, 0)  # Muda para vermelho
		await get_tree().create_timer(0.2).timeout
		modulate = Color(0, 1, 1)  # Muda para ciano
		await get_tree().create_timer(0.2).timeout
		modulate = cor_original  # Volta para a cor original
		await get_tree().create_timer(0.2).timeout
