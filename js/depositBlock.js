/**
 * Deposit Block JavaScript
 * Gerencia a funcionalidade do bloco de depósito no topo da página
 */

// Função principal para lidar com o clique no botão de depósito
function depositTopBlockClick() {
    try {
        // Log para debug (pode ser removido em produção)
        console.log('Deposit top block clicked');
        
        // Tentar abrir o modal de depósito se a função existir
        if (typeof openDepositModal === 'function') {
            console.log('Opening deposit modal');
            openDepositModal();
        } else {
            // Fallback para página de depósito
            console.log('Redirecting to /depositar');
            window.location.href = '/depositar';
        }
    } catch (error) {
        // Fallback em caso de erro
        console.error('Error in depositTopBlockClick:', error);
        window.location.href = '/depositar';
    }
}

// Função para esconder o bloco quando o usuário fizer um depósito aprovado
function hideDepositTopBlock() {
    try {
        const block = document.getElementById('depositTopBlock');
        if (block) {
            // Adicionar animação de saída
            block.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            block.style.opacity = '0';
            block.style.transform = 'translateY(-20px)';
            
            // Remover do DOM após a animação
            setTimeout(() => {
                block.style.display = 'none';
            }, 300);
            
            // Marcar no localStorage que o usuário tem depósito pago
            localStorage.setItem('hasAnyPaidDeposit', 'true');
        }
    } catch (error) {
        console.error('Error hiding deposit top block:', error);
    }
}

// Função para verificar se deve mostrar o bloco baseado no localStorage
function checkDepositBlockVisibility() {
    try {
        if (localStorage.getItem('hasAnyPaidDeposit') === 'true') {
            const block = document.getElementById('depositTopBlock');
            if (block) {
                block.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error checking deposit block visibility:', error);
    }
}

// Função para resetar o estado (útil para testes ou admin)
function resetDepositBlockState() {
    try {
        localStorage.removeItem('hasAnyPaidDeposit');
        const block = document.getElementById('depositTopBlock');
        if (block) {
            block.style.display = 'block';
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
        }
        console.log('Deposit block state reset');
    } catch (error) {
        console.error('Error resetting deposit block state:', error);
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar visibilidade do bloco
    checkDepositBlockVisibility();
    
    // Adicionar event listener para o botão se existir
    const button = document.querySelector('.deposit-top-block__button');
    if (button) {
        button.addEventListener('click', depositTopBlockClick);
    }
    
    // Adicionar suporte para tecla Enter no botão
    if (button) {
        button.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                depositTopBlockClick();
            }
        });
    }
});

// Expor funções globalmente para uso em outros scripts
window.depositTopBlockClick = depositTopBlockClick;
window.hideDepositTopBlock = hideDepositTopBlock;
window.resetDepositBlockState = resetDepositBlockState;

